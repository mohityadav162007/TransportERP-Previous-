import React from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import loadingSlipBg from '../../assets/loading_slip_template.png';

const LoadingSlip = ({ data = {}, slipNumber }) => {
    // Coordinate System: mm
    // Container: 148.5mm x 210mm (Half A4)

    // Style Utility for strict mill positioning
    const pos = (top, left, width = 'auto', align = 'left', fontSize = '12px', fontWeight = 'bold') => ({
        position: 'absolute',
        top: `${top}mm`,
        left: `${left}mm`,
        width: width,
        textAlign: align,
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: '#000', // Black text for print
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
                src={loadingSlipBg}
                alt="Loading Slip Template"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill' // Force 100% fill
                }}
            />

            {/* OVERLAY DATA FIELDS - Adjust coordinates based on template visual */}

            {/* No. (Sequence) - Assuming Top Left area */}
            <div style={pos(44, 28)}>
                {slipNumber}
            </div>

            {/* Date - Assuming Top Right area */}
            <div style={pos(44, 110)}>
                {displayDate}
            </div>

            {/* To (Upper) - Party Name */}
            <div style={pos(55, 20, '120mm')}>
                {data.party_name}
            </div>

            {/* Vehicle No */}
            <div style={pos(80, 48)}>
                {data.vehicle_number}
            </div>

            {/* From */}
            <div style={pos(91, 25, '35mm', 'center')}>
                {data.from_location}
            </div>

            {/* To (Lower) - Destination */}
            <div style={pos(91, 75, '35mm', 'center')}>
                {data.to_location}
            </div>

            {/* Rate (Party Freight) - "Rate" label usually implies rate per ton or total freight if fixed */}
            <div style={pos(103, 25, '35mm', 'center')}>
                {/* Leaving blank or using freight if rate not distinct */}
            </div>

            {/* Weight */}
            <div style={pos(103, 75, '35mm', 'center')}>
                {data.weight ? `${data.weight} MT` : ''}
            </div>

            {/* Freight (Party) */}
            <div style={pos(116, 35, '35mm', 'center')}>
                {data.party_freight ? formatCurrency(data.party_freight) : ''}
            </div>

            {/* Advance (Party) */}
            <div style={pos(116, 85, '35mm', 'center')}>
                {data.party_advance ? formatCurrency(data.party_advance) : ''}
            </div>

            {/* Balance (Party) */}
            <div style={pos(128, 35, '35mm', 'center')}>
                {data.party_balance ? formatCurrency(data.party_balance) : ''}
            </div>

        </div>
    );
};

export default LoadingSlip;
