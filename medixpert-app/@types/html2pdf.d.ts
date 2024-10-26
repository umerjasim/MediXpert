declare module 'html2pdf.js' {
    import { jsPDF } from 'jspdf';
    interface Options {
        margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
        filename?: string;
        image?: { type: string; quality: number };
        html2canvas?: { scale: number };
        jsPDF?: { unit: string; format: string; orientation: string };
    }
    function html2pdf(): {
        from(element: HTMLElement): { set(options: Options): any; save(): Promise<void> };
    };
    export default html2pdf;
}
