import React from 'react';

const LoadingSlip = ({ data = {}, slipNumber }) => {
    // Mapping:
    // Date -> Loading Date
    // To -> Party Name
    // Vehicle No. -> Vehicle Number
    // From -> Trip From
    // To (Dest) -> Trip To
    // Rate -> Party Freight
    // Weight -> Weight

    // "Loading Slip"

    return (
        <div className="h-full w-full border border-black p-4 flex flex-col font-serif relative">
            {/* Header */}
            {/* Header */}
            <div className="border-b-2 border-black pb-2 mb-4">
                <div className="flex justify-between items-start">
                    {/* Left Zone - Spacer to balance Right Zone */}
                    <div className="w-32 flex-shrink-0"></div>

                    {/* Center Zone - Main Title & Address */}
                    <div className="flex-grow text-center">
                        <h1 className="text-3xl font-bold text-blue-900 uppercase tracking-wider scale-y-110">Shri Sanwariya Road Lines</h1>
                        <p className="text-[10px] mt-1 font-bold">19, 20, 22, 32, Feet Container, Open Body Available</p>
                        <p className="text-[10px] mt-0.5">Plot No. 24, New Loha Mandi, Gopal Gang Square, Dewas Naka, Indore (M.P.) 452010</p>
                    </div>

                    {/* Right Zone - Mobile Number (Fixed Container) */}
                    <div className="w-32 flex-shrink-0 text-right">
                        <p className="text-[11px] font-bold mt-1">Mob.: 6260001228</p>
                    </div>
                </div>
            </div>

            {/* Slip Info */}
            <div className="flex justify-between items-end mb-6 px-2">
                <div className="flex items-end gap-2">
                    <span className="font-bold text-sm">No.</span>
                    <span className="text-xl font-bold text-blue-900 leading-none">{slipNumber || ''}</span>
                </div>

                <div className="border border-black rounded-full px-4 py-1">
                    <span className="font-bold text-sm">Loading Slip</span>
                </div>

                <div className="flex items-end gap-2 w-32 border-b border-black pb-0.5">
                    <span className="font-bold text-sm whitespace-nowrap">Date</span>
                    <span className="font-bold text-blue-800 flex-grow text-center">
                        {data.loading_date ? new Date(data.loading_date).toLocaleDateString('en-GB') : ''}
                    </span>
                </div>
            </div>

            {/* Fields Table */}
            <div className="flex-grow">
                <table className="w-full border-collapse">
                    <tbody>
                        {/* To */}
                        <tr className="border-b border-black">
                            <td className="font-bold w-12 py-2 whitespace-nowrap align-bottom">To</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom font-mono" colSpan="3">
                                {data.party_name || ''}
                            </td>
                        </tr>

                        {/* From / To */}
                        <tr className="border-b border-black">
                            <td className="font-bold w-12 py-2 whitespace-nowrap align-bottom">From</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom border-r border-black font-mono w-[40%]">
                                {data.from_location || ''}
                            </td>
                            <td className="font-bold w-8 px-2 py-2 whitespace-nowrap align-bottom">To</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom font-mono">
                                {data.to_location || ''}
                            </td>
                        </tr>

                        {/* Vehicle No */}
                        <tr className="border-b border-black">
                            <td className="font-bold py-2 whitespace-nowrap align-bottom" colSpan="1">Vehicle No.</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom font-mono" colSpan="3">
                                {data.vehicle_number || ''}
                            </td>
                        </tr>

                        {/* Rate */}
                        <tr className="border-b border-black">
                            <td className="font-bold py-2 whitespace-nowrap align-bottom">Rate</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom font-mono" colSpan="3">
                                {data.party_freight || ''}
                            </td>
                        </tr>

                        {/* Weight */}
                        <tr className="border-b border-black">
                            <td className="font-bold py-2 whitespace-nowrap align-bottom">Weight</td>
                            <td className="font-bold text-blue-800 text-lg px-2 align-bottom font-mono" colSpan="3">
                                {data.weight ? data.weight + ' MT' : ''}
                            </td>
                        </tr>

                        {/* Advance */}
                        <tr className="border-b border-black">
                            <td className="font-bold py-2 whitespace-nowrap align-bottom">Advance</td>
                            <td className="align-bottom" colSpan="3"></td>
                        </tr>


                        {/* Balance */}
                        <tr className="border-b border-black">
                            <td className="font-bold py-2 whitespace-nowrap align-bottom">Balance</td>
                            <td className="align-bottom" colSpan="3"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 flex justify-end">
                <div className="text-center">
                    <div className="font-bold text-sm mb-12">For. Shri Sanwariya Road Lines</div>
                    <div className="border-t border-black w-48 mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSlip;
