declare module 'jspdf-autotable' {
    import jsPDF from 'jspdf';

    interface AutoTableOptions {
        head?: string[][]; // Array of header row(s)
        body?: any[][]; // Array of body row(s)
        margin?: { top?: number; bottom?: number; left?: number; right?: number };
        styles?: any; // Other styles options
        // Add any other options you'd like to use
    }

    function autoTable(doc: jsPDF, options: AutoTableOptions): void;

    export default autoTable;
}
