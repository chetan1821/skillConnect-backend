/**
 * One-click Client-Side CSV Export Utility
 */
export const exportToCsv = (filename, data = [], columns = []) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // If columns are not explicitly passed, infer from first object keys
  const cols = columns.length
    ? columns
    : Object.keys(data[0]).map(k => ({
        header: k.replace(/_/g, ' ').toUpperCase(),
        key: k
      }));

  const headers = cols.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');

  const rows = data.map(item => {
    return cols
      .map(col => {
        let val = typeof col.key === 'function' ? col.key(item) : item[col.key];
        if (val === null || val === undefined) val = '';
        if (Array.isArray(val)) val = val.join('; ');
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

