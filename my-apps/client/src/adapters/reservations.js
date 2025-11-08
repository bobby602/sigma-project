// src/adapters/reservations.js
const pad2 = (n) => String(n).padStart(2, '0');
const formatDDMMYYYY = (d) => {
  if (!d) return null;
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return `${pad2(x.getDate())}/${pad2(x.getMonth() + 1)}/${x.getFullYear()}`;
};

export const adaptReservationRow = (r = {}) => {
  const id        = r.id ?? r.ID ?? null;
  const itemCode  = r.itemCode ?? r.ItemCode ?? '';
  const itemName  = r.itemName ?? r.ItemName ?? r.Name ?? '';
  const qtyRaw    = r.qty ?? r.Qty ?? r.QTY ?? 0;
  const pack      = r.pack ?? r.Pack ?? '';
  const saleCode  = r.saleCode ?? r.SaleCode ?? '';
  const saleName  = r.saleName ?? r.SaleName ?? '';
  const code      = r.code ?? r.Code ?? null;
  const nameFGS   = r.nameFGS ?? r.NameFGS ?? null;
  const docdate   = r.docdate ?? r.DocDate ?? null;
  const docdateT  = r.docdateT ?? r.DocDateT ?? formatDDMMYYYY(docdate);

  return {
    id,
    itemCode,
    itemName,
    qty: Number(qtyRaw) || 0,
    pack,
    saleCode,
    saleName,
    code,
    nameFGS,
    docdate,
    docdateT,
  };
};

export const adaptReservationArray = (arr) =>
  Array.isArray(arr) ? arr.map(adaptReservationRow) : [];
