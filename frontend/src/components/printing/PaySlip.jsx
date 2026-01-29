import React from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import paySlipBg from '../../assets/pay_slip_template.png';

const PaySlip = ({ data = {}, slipNumber }) => {
    // Coordinate System: mm
    // Container: 148.5mm x 210mm (Half A4)

    const pos = (top, left, width = 'auto', align = 'left', fontSize = '12px', fontWeight = 'bold') => ({
        position: 'absolute',
        top: `${top}mm`,
        left: `${left}mm`,
        width: width,
        textAlign: align,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: '#000',
        fontFamily: 'Arial, sans-serif',
        zIndex: 10,
        whiteSpace: 'nowrap'
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
                backgroundColor: 'white'
            }}
        >
            {/* Background Template */}
            <img
                src={paySlipBg}
                alt="Pay Slip Template"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill'
                }}
            />

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

            {/* From - Route From? Check previous PaySlip structure logic */}
            {/* Previous PaySlip had From/To on Row 3 */}
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

            {/* Driver No - Assuming next to Vehicle or on next line */}
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

            {/* Freight - Assuming same as rate in total column? */}
            <div style={pos(116, 35, '35mm', 'center')}>
                {data.gaadi_freight ? formatCurrency(data.gaadi_freight) : ''}
            </div>

            {/* Advance? Not explicitly mapped in strict rules but usually present */}
            {/* The user rules said: Rate -> gaadi_freight, Freight -> gaadi_freight. Explicit binding. */}

        </div>
    );
};

export default PaySlip;
