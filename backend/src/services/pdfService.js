import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../assets');

export const generateSlipPdf = (tripData, options = { left: 'loading_slip', right: 'pay_slip' }, slipNumbers = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0,
                autoFirstPage: true
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Conversion utility: mm to points (1mm = 2.83465 pt)
            const mm = (val) => val * 2.83465;

            // Dimensions
            const PAGE_WIDTH_MM = 297;
            const PAGE_HEIGHT_MM = 210;
            const HALF_WIDTH_MM = 148.5;

            // Helper to draw a slip
            const drawSlip = (type, xOffsetMm) => {
                if (!type) return;

                const isPay = type === 'pay_slip';
                const bgImage = isPay ? 'pay_slip_template.png' : 'loading_slip_template.png';
                const bgPath = path.join(ASSETS_DIR, bgImage);

                // Draw Background
                doc.image(bgPath, mm(xOffsetMm), 0, {
                    width: mm(HALF_WIDTH_MM),
                    height: mm(PAGE_HEIGHT_MM)
                });

                // Style for text
                doc.font('Helvetica-Bold').fontSize(10).fillColor('black');

                // Data Binding Helper
                // x, y are in mm, relative to the slip's top-left
                // text is the string to print
                const text = (str, x, y, width = null, align = 'left') => {
                    if (!str) return;

                    // Adjust Y for font ascent/vertical alignment as per requirement (+1.5mm)
                    const absoluteX = mm(xOffsetMm + x);
                    const absoluteY = mm(y + 1.5);

                    const opts = {
                        width: width ? mm(width) : undefined,
                        align: align
                    };

                    doc.text(String(str), absoluteX, absoluteY, opts);
                };

                // Formatters
                const fmtCurrency = (val) => val ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val) : '';
                const fmtDate = (val) => {
                    if (!val) return '';
                    const d = new Date(val);
                    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
                };

                // Slip Number
                const slipNum = isPay ? slipNumbers.pay : slipNumbers.loading;
                text(slipNum, 28, 44);

                // Date
                text(fmtDate(tripData.loading_date), 110, 44);

                // Vehicle No
                text(tripData.vehicle_number, 48, 80);

                if (isPay) {
                    // --- Pay Slip Fields ---
                    // To (Upper) - Motor Owner
                    text(tripData.motor_owner_name, 20, 55, 120);
                    // From
                    text(tripData.from_location, 25, 68, 35, 'center');
                    // To (Lower)
                    text(tripData.to_location, 75, 68, 35, 'center');
                    // Driver No
                    text(tripData.driver_number, 110, 95, 35);
                    // Rate (Gaadi Freight)
                    text(fmtCurrency(tripData.gaadi_freight), 25, 103, 35, 'center');
                    // Weight
                    text(tripData.weight ? `${tripData.weight} MT` : '', 75, 103, 35, 'center');
                    // Freight (Gaadi)
                    text(fmtCurrency(tripData.gaadi_freight), 35, 116, 35, 'center');

                } else {
                    // --- Loading Slip Fields ---
                    // To (Upper) - Party Name
                    text(tripData.party_name, 20, 55, 120);
                    // From
                    text(tripData.from_location, 25, 91, 35, 'center');
                    // To (Lower)
                    text(tripData.to_location, 75, 91, 35, 'center');
                    // Rate (Party Freight - usually hidden/blank on slip as per React code?) 
                    // React code had "Blank" for Rate at pos(103, 25).

                    // Weight
                    text(tripData.weight ? `${tripData.weight} MT` : '', 75, 103, 35, 'center');

                    // Freight (Party)
                    text(fmtCurrency(tripData.party_freight), 35, 116, 35, 'center');
                    // Advance
                    text(fmtCurrency(tripData.party_advance), 85, 116, 35, 'center');
                    // Balance
                    text(fmtCurrency(tripData.party_balance), 35, 128, 35, 'center');
                }
            };

            // Draw Left Slip
            if (options.left) {
                drawSlip(options.left, 0);
            }

            // Draw Right Slip
            if (options.right) {
                drawSlip(options.right, HALF_WIDTH_MM);
            }

            doc.end();

        } catch (err) {
            reject(err);
        }
    });
};
