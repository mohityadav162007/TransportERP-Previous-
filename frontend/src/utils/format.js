export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "-";
    const num = Number(amount);
    if (isNaN(num)) return "-";

    // Round to integer and format with Indian locale (en-IN gives 1,00,000 style)
    // or en-US for standard 100,000. User asked for "no decimals".
    // Using 'en-IN' is appropriate for an Indian Transport ERP.
    return Math.round(num).toLocaleString('en-IN');
};

export const formatDate = (date, includeYear = false) => {
    if (!date) return "-";
    const options = {
        day: "2-digit",
        month: "short",
    };
    if (includeYear) options.year = "numeric";
    return new Date(date).toLocaleDateString("en-GB", options);
};
