import React from 'react';
import { formatCurrency } from '../../utils/format';

const LoadingSlip = ({ data = {}, slipNumber }) => {
    // Helper for formatting date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="h-full w-full bg-white text-black font-serif relative p-8 border border-gray-300 pointer-events-none print:pointer-events-auto print:border-none">

            {/* Main Border Container */}
            <div className="border-2 border-black h-full flex flex-col">

                {/* Header Section */}
                <div className="border-b-2 border-black relative">
                    <div className="absolute top-2 right-2 font-bold text-sm">
                        Mob : 6260001228
                    </div>
                    <div className="text-center pt-4 pb-2 px-4">
                        <h1 className="text-4xl font-bold uppercase tracking-tight mb-1">Shri Sanwariya Road Lines</h1>
                        <p className="font-bold text-sm mb-1">19, 20, 22, 32 Feet Containers, Open Body Available</p>
                        <div className="border-t border-black w-full my-1"></div>
                        <p className="text-sm font-medium">Plot No. 24, New Loha Mandi, Gopal Ganj Square,</p>
                        <p className="text-sm font-medium">Dewas Naka, Indore (M.P.) 452010</p>
                    </div>
                </div>

                {/* Slip Metadata */}
                <div className="px-6 py-4 flex justify-between items-end">
                    <div className="flex items-end gap-2 w-1/4">
                        <span className="font-bold text-lg">No.</span>
                        <div className="border-b border-black flex-grow text-center font-bold text-xl relative top-1">
                            {slipNumber}
                        </div>
                    </div>

                    <div className="border-2 border-black rounded-3xl px-6 py-1 mx-4">
                        <h2 className="text-xl font-bold uppercase tracking-wider">Loading Slip</h2>
                    </div>

                    <div className="flex items-end gap-2 w-1/3">
                        <span className="font-bold text-lg">Date</span>
                        <div className="border-b border-black flex-grow text-center font-bold text-lg relative top-1">
                            {formatDate(data.loading_date)}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 flex-grow flex flex-col gap-6 mt-2">

                    {/* To Field */}
                    <div className="flex items-end gap-2">
                        <span className="font-bold text-lg whitespace-nowrap">To</span>
                        <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2">
                            {data.party_name}
                        </div>
                    </div>

                    {/* Standard Text */}
                    <div className="text-sm font-medium leading-tight text-gray-800">
                        <p>As per your order, we are sending our truck for loading you goods.</p>
                        <p>Kindly arrange to load the same handover all the documents, through the bearer of this letter.</p>
                    </div>

                    {/* Vehicle No */}
                    <div className="flex items-end gap-2">
                        <span className="font-bold text-lg whitespace-nowrap">Vehicle No.</span>
                        <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-4">
                            {data.vehicle_number}
                        </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-end gap-4">
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg">From</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.from_location}
                            </div>
                        </div>
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg">To</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.to_location}
                            </div>
                        </div>
                    </div>

                    {/* Rate & Weight */}
                    <div className="flex items-end gap-4">
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg">Rate</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {/* Rate left blank as per request or manually filled if needed */}
                            </div>
                        </div>
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg">Weight</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.weight ? `${data.weight} MT` : ''}
                            </div>
                        </div>
                    </div>

                    {/* Freight & Advance */}
                    <div className="flex items-end gap-4">
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg whitespace-nowrap">Freight Rs.</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.party_freight ? formatCurrency(data.party_freight) : ''}
                            </div>
                        </div>
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg whitespace-nowrap">Advance Rs.</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.party_advance ? formatCurrency(data.party_advance) : ''}
                            </div>
                        </div>
                    </div>

                    {/* Balance & Extra */}
                    <div className="flex items-end gap-4">
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg whitespace-nowrap">Balance Rs.</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {data.party_balance ? formatCurrency(data.party_balance) : ''}
                            </div>
                        </div>
                        <div className="flex items-end gap-2 flex-grow">
                            <span className="font-bold text-lg whitespace-nowrap">Extra Rs.</span>
                            <div className="border-b border-black flex-grow font-bold text-xl relative top-1 px-2 text-center">
                                {/* Extra Rs left blank */}
                            </div>
                        </div>
                    </div>

                    {/* Document Checkboxes */}
                    <div className="flex justify-between items-center px-8 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">R. C.</span>
                            <div className="w-12 h-8 border border-black"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">PAN CARD</span>
                            <div className="w-12 h-8 border border-black"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">TDS FORM</span>
                            <div className="w-12 h-8 border border-black"></div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end mt-12 mb-4">
                        <div className="font-bold text-sm">
                            Balance Paid
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold flex items-center gap-1">
                                For. <span className="text-lg font-bold">Shri Sanwariya Road Lines</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Terms */}
                <div className="border-t border-black p-4 text-xs font-medium leading-relaxed">
                    <p>Loading and Unloading will be arranged by you.</p>
                    <p>Transit In durance shall be arranged by you/your party.</p>
                    <p>Check all the papers before loading.</p>
                    <p>Handover all the concerned documents to the driver.</p>
                    <p>We are not responsible for any damage due to rain, theft accident etc.</p>
                </div>

            </div>
        </div>
    );
};

export default LoadingSlip;
