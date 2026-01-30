import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONSTANTS (A4 Landscape)
const A4_WIDTH = 841.89;
const A4_HEIGHT = 595.28;
const SLIP_WIDTH = 420.945; // 148.5mm converted to points
const SLIP_HEIGHT = 595.28; // 210mm converted to points

// ASSET PATHS
const LOADING_SLIP_PATH = path.join(__dirname, '../assets/loading_slip_template.png');
const PAY_SLIP_PATH = path.join(__dirname, '../assets/pay_slip_template.png');

// COORDINATE MAPPING (Derived from template analysis)
// All coordinates are relative to the slip's top-left corner (0,0)
// Format: { x: mm, y: mm } -> will be converted to points
const LOADING_FIELDS = {
    number: { x: 112, y: 35 },     // Top Right Box
    date: { x: 112, y: 42 },       // Below Number
    partyName: { x: 35, y: 64 },   // Party Name Line
    from: { x: 35, y: 72 },        // From
    to: { x: 85, y: 72 },          // To
    vehicleNo: { x: 45, y: 80 },   // Vehicle No
    weight: { x: 95, y: 80 },      // Weight
    rate: { x: 35, y: 88 },        // Rate
    freight: { x: 80, y: 88 },     // Freight (Total)
    advance: { x: 35, y: 96 },   // Advance
    balance: { x: 80, y: 96 },   // Balance
    remarks: { x: 35, y: 110 }     // Remarks area
};

const PAY_FIELDS = {
    number: { x: 112, y: 35 },     // Top Right Box
    date: { x: 112, y: 42 },       // Below Number
    motorOwner: { x: 40, y: 64 },  // Motor Owner Name
    driverNo: { x: 95, y: 64 },    // Driver Mobile
    from: { x: 35, y: 72 },        // From
    to: { x: 85, y: 72 },          // To
    vehicleNo: { x: 45, y: 80 },   // Vehicle No
    weight: { x: 95, y: 80 },      // Weight
    rate: { x: 35, y: 88 },        // Rate
    freight: { x: 80, y: 88 },     // Freight (Total)
    advance: { x: 35, y: 96 },   // Advance
    balance: { x: 80, y: 96 },   // Balance
    remarks: { x: 35, y: 110 }     // Remarks
};

// HELPER: Convert mm to points (1mm = 2.83465 points)
const mmToPt = (mm) => mm * 2.83465;

// HELPER: Draw text at baseline
const drawText = (doc, text, xMm, yMm, slipOffsetX = 0) => {
    if (!text) return;

    const x = slipOffsetX + mmToPt(xMm);
    const y = mmToPt(yMm);
    const fontSize = 10;

    // Baseline correction: pdfkit coordinates are top-left of text box.
    // To place text ON a line at `y`, we assume `y` is the baseline.
    // pdfkit doesn't support direct baseline positioning, so we subtract ~75% of font size.
    const yCorrected = y - (fontSize * 0.75);

    doc.fontSize(fontSize)
        .font('Helvetica-Bold') // Using standard font as requested
        .text(String(text), x, yCorrected, {
            lineBreak: false,
            width: 200 // Prevent wrapping
        });
};

export const generateSlipPdf = (tripData, options = {}, slipNumbers = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                autoFirstPage: true
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // 1. LEFT SIDE (Loading Slip)
            if (options.left === 'loading_slip') {
                doc.image(LOADING_SLIP_PATH, 0, 0, { width: SLIP_WIDTH, height: SLIP_HEIGHT });

                const data = {
                    number: slipNumbers.loading || 'PREVIEW',
                    date: formatDate(tripData.loading_date),
                    partyName: tripData.party_name,
                    from: tripData.from_location,
                    to: tripData.to_location,
                    vehicleNo: tripData.vehicle_number,
                    weight: tripData.weight ? `${tripData.weight} MT` : '',
                    rate: formatMoney(tripData.party_freight / (tripData.weight || 1)), // Infer rate if needed or use total
                    freight: formatMoney(tripData.party_freight),
                    advance: formatMoney(tripData.party_advance),
                    balance: formatMoney(tripData.party_balance),
                    remarks: tripData.remark || ''
                };

                // Map fields
                drawText(doc, data.number, LOADING_FIELDS.number.x, LOADING_FIELDS.number.y, 0);
                drawText(doc, data.date, LOADING_FIELDS.date.x, LOADING_FIELDS.date.y, 0);
                drawText(doc, data.partyName, LOADING_FIELDS.partyName.x, LOADING_FIELDS.partyName.y, 0);
                drawText(doc, data.from, LOADING_FIELDS.from.x, LOADING_FIELDS.from.y, 0);
                drawText(doc, data.to, LOADING_FIELDS.to.x, LOADING_FIELDS.to.y, 0);
                drawText(doc, data.vehicleNo, LOADING_FIELDS.vehicleNo.x, LOADING_FIELDS.vehicleNo.y, 0);
                drawText(doc, data.weight, LOADING_FIELDS.weight.x, LOADING_FIELDS.weight.y, 0);
                // drawText(doc, data.rate, LOADING_FIELDS.rate.x, LOADING_FIELDS.rate.y, 0); // Optional: if rate exists
                drawText(doc, data.freight, LOADING_FIELDS.freight.x, LOADING_FIELDS.freight.y, 0);
                drawText(doc, data.advance, LOADING_FIELDS.advance.x, LOADING_FIELDS.advance.y, 0);
                drawText(doc, data.balance, LOADING_FIELDS.balance.x, LOADING_FIELDS.balance.y, 0);
            }

            // 2. RIGHT SIDE (Pay Slip)
            if (options.right === 'pay_slip') {
                const offsetX = SLIP_WIDTH; // Shift to right half
                doc.image(PAY_SLIP_PATH, offsetX, 0, { width: SLIP_WIDTH, height: SLIP_HEIGHT });

                const data = {
                    number: slipNumbers.pay || 'PREVIEW',
                    date: formatDate(tripData.loading_date),
                    motorOwner: tripData.motor_owner_name,
                    driverNo: tripData.driver_number || tripData.motor_owner_number,
                    from: tripData.from_location,
                    to: tripData.to_location,
                    vehicleNo: tripData.vehicle_number,
                    weight: tripData.weight ? `${tripData.weight} MT` : '',
                    freight: formatMoney(tripData.gaadi_freight),
                    advance: formatMoney(tripData.gaadi_advance),
                    balance: formatMoney(tripData.gaadi_balance),
                    remarks: tripData.remark || ''
                };

                // Map fields
                drawText(doc, data.number, PAY_FIELDS.number.x, PAY_FIELDS.number.y, offsetX);
                drawText(doc, data.date, PAY_FIELDS.date.x, PAY_FIELDS.date.y, offsetX);
                drawText(doc, data.motorOwner, PAY_FIELDS.motorOwner.x, PAY_FIELDS.motorOwner.y, offsetX);
                drawText(doc, data.driverNo, PAY_FIELDS.driverNo.x, PAY_FIELDS.driverNo.y, offsetX);
                drawText(doc, data.from, PAY_FIELDS.from.x, PAY_FIELDS.from.y, offsetX);
                drawText(doc, data.to, PAY_FIELDS.to.x, PAY_FIELDS.to.y, offsetX);
                drawText(doc, data.vehicleNo, PAY_FIELDS.vehicleNo.x, PAY_FIELDS.vehicleNo.y, offsetX);
                drawText(doc, data.weight, PAY_FIELDS.weight.x, PAY_FIELDS.weight.y, offsetX);
                drawText(doc, data.freight, PAY_FIELDS.freight.x, PAY_FIELDS.freight.y, offsetX);
                drawText(doc, data.advance, PAY_FIELDS.advance.x, PAY_FIELDS.advance.y, offsetX);
                drawText(doc, data.balance, PAY_FIELDS.balance.x, PAY_FIELDS.balance.y, offsetX);
            }

            doc.end();

        } catch (err) {
            reject(err);
        }
    });
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
}

function formatMoney(amount) {
    if (amount === undefined || amount === null) return '';
    return Number(amount).toLocaleString('en-IN');
}
