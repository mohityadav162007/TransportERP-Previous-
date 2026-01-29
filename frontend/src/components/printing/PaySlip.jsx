import React from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import paySlipBg from '../../assets/pay_slip_template.png';

const PaySlip = ({ data = {}, slipNumber }) => {
    // Canvas: 148.5mm x 210mm
    // Font: pt only
    // Line-height: 1
    // Vertical Offset: +1.5mm (Compensate ascent)

    const pos = (top, left, width = 'auto', align = 'left', fontSize = '10pt', fontWeight = 'bold') => ({
        position: 'absolute',
        top: `${top + 1.5}mm`,
        left: `${left}mm`,
        width: width,
        textAlign: align,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: '#000',
        fontFamily: 'Arial, sans-serif',
        zIndex: 10,
        whiteSpace: 'nowrap',
        lineHeight: 1
    });

    const displayDate = data.loading_date ? formatDate(data.loading_date) : '';

    return (
        <div
            className="print-slip-container"
            style={{
                width: '148.5mm',
                height: '210mm',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'white',
                margin: 0,
                padding: 0,
                backgroundImage: `url(${paySlipBg})`,
                backgroundSize: '148.5mm 210mm',
                backgroundPosition: '0mm 0mm',
                backgroundRepeat: 'no-repeat',
                boxSizing: 'border-box'
            }}
        >
            {/* OVERLAY DATA FIELDS */}

            {/* No. */}
            <div style={pos(44, 28)}>
                {slipNumber}
            </div>

            {/* Date */}
            <div style={pos(44, 110)}>
                {displayDate}
            </div>

            {/* To (Upper) - Motor Owner Name */}
            <div style={pos(55, 20, '120mm')}>
                {data.motor_owner_name}
            </div>

            {/* From */}
            <div style={pos(68, 25, '35mm', 'center')}>
                {data.from_location}
            </div>

            {/* To (Lower) - Destination */}
            <div style={pos(68, 75, '35mm', 'center')}>
                {data.to_location}
            </div>

            {/* Vehicle No */}
            <div style={pos(80, 48)}>
                {data.vehicle_number}
            </div>

            {/* Driver No */}
            <div style={pos(95, 110, '35mm')}>
                {data.driver_number}
            </div>

            {/* Rate (Gaadi Freight) */}
            <div style={pos(103, 25, '35mm', 'center')}>
                {data.gaadi_freight ? formatCurrency(data.gaadi_freight) : ''}
            </div>

            {/* Weight */}
            <div style={pos(103, 75, '35mm', 'center')}>
                {data.weight ? `${data.weight} MT` : ''}
            </div>

            {/* Freight */}
            <div style={pos(116, 35, '35mm', 'center')}>
                {data.gaadi_freight ? formatCurrency(data.gaadi_freight) : ''}
            </div>

        </div>
    );
};

export default PaySlip;
