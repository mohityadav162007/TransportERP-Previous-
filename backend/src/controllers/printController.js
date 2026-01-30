import { generateSlipPdf } from '../services/pdfService.js';
import { pool } from '../db.js';

export const generatePdf = async (req, res) => {
    try {
        const { tripData, options, slipNumbers } = req.body;

        if (!tripData) {
            return res.status(400).json({ error: 'Trip data is required' });
        }

        // Validate options
        // options: { left: 'loading_slip'|'pay_slip'|null, right: ... }

        const pdfBuffer = await generateSlipPdf(tripData, options, slipNumbers);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="slip_${tripData.trip_code || 'generated'}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
