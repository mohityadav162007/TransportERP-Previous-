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

            {/* Fields */}
            <div className="flex flex-col gap-0 flex-grow px-2">

                {/* To */}
                <div className="flex items-end border-b border-black py-2">
                    <div className="w-10 flex-shrink-0 font-bold">To</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2">
                        {data.party_name || ''}
                    </div>
                </div>

                {/* From / To (Dest) */}
                <div className="flex items-end border-b border-black py-2">
                    <div className="w-12 flex-shrink-0 font-bold">From</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2 border-r border-black mr-2">
                        {data.from_location || ''}
                    </div>
                    <div className="w-8 flex-shrink-0 font-bold pl-2">To</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2">
                        {data.to_location || ''}
                    </div>
                </div>

                {/* Vehicle No */}
                <div className="flex items-end border-b border-black py-2">
                    <div className="w-24 flex-shrink-0 font-bold">Vehicle No.</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2">
                        {data.vehicle_number || ''}
                    </div>
                </div>

                {/* Other Fields from prompt mapping */}
                <div className="flex items-end border-b border-black py-2">
                    <div className="w-24 flex-shrink-0 font-bold">Rate</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2">
                        {data.party_freight || ''}
                    </div>
                </div>

                <div className="flex items-end border-b border-black py-2">
                    <div className="w-24 flex-shrink-0 font-bold">Weight</div>
                    <div className="flex-grow font-bold text-blue-800 text-lg px-2">
                        {data.weight ? data.weight + ' MT' : ''}
                    </div>
                </div>

                {/* Explicitly Mapped fields end. Rest are blank as per instruction "If a field is not explicitly mapped, it must remain blank" */}
                <div className="flex items-end border-b border-black py-2">
                    <div className="w-24 flex-shrink-0 font-bold">Advance</div>
                    <div className="flex-grow"></div>
                </div>

                <div className="flex items-end border-b border-black py-2">
                    <div className="w-24 flex-shrink-0 font-bold">Balance</div>
                    <div className="flex-grow"></div>
                </div>
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
