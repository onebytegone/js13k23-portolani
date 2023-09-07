export default function formatDate(date: Date): string {
   return date.toISOString().replace(/T.*/, '');
}
