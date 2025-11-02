import React, { Fragment, useMemo, useCallback } from 'react';
import Styles from './ProductTable.module.css';

/* ---------- Helpers ---------- */
const pick = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
};
const toNum = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const fmtNum = (v) =>
  v === undefined || v === null || v === ''
    ? '-'
    : Number.isFinite(Number(v))
    ? Number(v).toLocaleString()
    : String(v);
const fmtDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const typeLabel = (t) => ({ '1':'RM', '2':'TE', '3':'SI', '4':'SF' }[String(t)] || String(t || '-'));
const typeClass = (t) => (t==='1' ? Styles.pillBlue : t==='2' ? Styles.pillPurple : Styles.pillSlate);

/** map row to unified keys */
const mapRow = (item) => ({
  ItemCode: pick(item, ['ItemCode','itemcode','Code','code']),
  Name: pick(item, ['Name','name','ItemName','ItemNameTH','ItemNameEN']),
  Pack: pick(item, ['Pack','pack']),
  TyItemDm: pick(item, ['TyItemDm','TyItemDM','type']),
  CostN: pick(item, ['CostN','costNew','costN']),
  Price: pick(item, ['Price','price']),
  PriceRE: pick(item, ['PriceRE','priceRe','PriceRe']),
  PriceOffer: pick(item, ['PriceOffer','priceOffer']),
  QBal: pick(item, ['QBal','qBal','QtyBalance']),
  BAL: pick(item, ['BAL','bal']),
  minPrice: pick(item, ['minPrice','MinPrice']),
  maxPrice: pick(item, ['maxPrice','MaxPrice']),
  DepartCode: pick(item, ['DepartCode','departCode']),
  DepartName: pick(item, ['DepartName','DePartName','departName','departname']),
  DateCN: pick(item, ['DateCN','DateCn','dateCN','dateCn']),
  DatePrice: pick(item, ['DatePrice','datePrice']),
  DatePriceRE: pick(item, ['DatePriceRE','datePriceRe']),
  RowNum: toNum(pick(item, ['RowNum','rowNum']), 1),
  Reserve: pick(item, ['Reserve','reserve']),
});

const ProductTable = ({ data = [], pagination = {}, onPageChange, handleOnClick, hasSearch = false }) => {
  const { page = 1, totalPages = 1, total = 0, hasPrev = false, hasNext = false, limit = 20 } = pagination;

  const jsonToken = useMemo(() => {
    try { const token = sessionStorage.getItem('token'); return token ? JSON.parse(token) : null; }
    catch { return null; }
  }, []);

  // 1) ดึงข้อมูลที่ backend ส่งมา
  const baseData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // 2) ถ้า backend ไม่ได้ส่ง header rows มา (RowNum=0) และไม่มีการค้นหา
  //    ให้ FE เติม header rows ตาม DepartName เพื่อให้หน้าตาเหมือนเดิม
  const displayData = useMemo(() => {
    if (!baseData.length) return [];
    const alreadyHasHeaders = baseData.some(r => (r.RowNum ?? r.rowNum) === 0);
    if (alreadyHasHeaders || hasSearch) return baseData;

    // จัดกลุ่มตาม Department แล้วแทรก header
      const sorted = [...baseData].sort((a, b) => {
      const getDept = (x) => x?.DepartName ?? x?.DePartName ?? '';
      const da = String(getDept(a)).localeCompare(String(getDept(b)));
      if (da !== 0) return da;
      return String(a.ItemCode || '').localeCompare(String(b.ItemCode || ''));
    });

    const out = [];
    let lastDept = null;
    for (const it of sorted) {
      const dept = (it.DepartName ?? it.DePartName ?? '') || '';
      if (dept !== lastDept) {
        out.push({
          RowNum: 0,
          rowNum: 0,
          Name: dept || '(ไม่ระบุแผนก)',
          DepartName: dept
        });
        lastDept = dept;
      }
      out.push(it);
    }
    return out;
  }, [baseData, hasSearch]);

  const handlePrev = useCallback(() => { 
    if (onPageChange && hasPrev) onPageChange(Math.max(1, page - 1));
  }, [onPageChange, page, hasPrev]);

  const handleNext = useCallback(() => { 
    if (onPageChange && hasNext) onPageChange(Math.min(totalPages, page + 1));
  }, [onPageChange, page, totalPages, hasNext]);

  const handleGoTo = useCallback((targetPage) => { 
    if (onPageChange && targetPage >= 1 && targetPage <= totalPages) onPageChange(targetPage);
  }, [onPageChange, totalPages]);

  const renderPageButtons = () => {
    if (totalPages <= 1) return null;
    const windowSize = 5; 
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half); 
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    
    const btns = [];
    if (start > 1) {
      btns.push(
        <button key="page-1" onClick={() => handleGoTo(1)} className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">1</button>
      );
      if (start > 2) btns.push(<span key="dots-1" className="px-2 text-gray-400">...</span>);
    }
    for (let i = start; i <= end; i++) {
      btns.push(
        <button
          key={`page-${i}`}
          onClick={() => handleGoTo(i)}
          className={`px-3 py-2 text-sm rounded-lg ${i === page ? 'bg-blue-600 text-white font-semibold' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) btns.push(<span key="dots-2" className="px-2 text-gray-400">...</span>);
      btns.push(
        <button key={`page-${totalPages}`} onClick={() => handleGoTo(totalPages)} className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
          {totalPages}
        </button>
      );
    }
    return btns;
  };

  const renderTableRows = () => {
    if (!displayData || displayData.length === 0) {
      return (
        <tr>
          <td colSpan={jsonToken?.StAdmin === '1' ? 17 : 8} className={Styles.td} style={{padding:'3rem 1rem'}}>
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 mb-3 rounded-full flex items-center justify-center" style={{background:'#f1f5f9'}}>
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-500">ไม่มีข้อมูล</p>
              <p className="text-sm text-gray-400">ลองค้นหาหรือเลือก Material Type</p>
            </div>
          </td>
        </tr>
      );
    }

    return displayData.map((item, idx) => {
      const r = mapRow(item);
      const key = `product-${r.ItemCode ?? r.Name ?? idx}-${idx}`;

      // Header Row (Department)
      if (r.RowNum === 0) {
        return (
          <tr key={key} className={Styles.row}>
            <td className={Styles.td}>
              <span className="font-semibold">{r.DepartName || r.Name || '-'}</span>
            </td>
            {/* ช่องว่างอื่นให้เป็นขีด/ว่างเพื่อความเรียบร้อย */}
            {(jsonToken?.StAdmin === '1' ? Array.from({length:16}) : Array.from({length:7})).map((_,i)=>(
              <td key={`${key}-pad-${i}`} className={`${Styles.td} ${Styles.muted}`}>-</td>
            ))}
          </tr>
        );
      }

      if (jsonToken?.StAdmin === '1') {
        return (
          <tr key={key} className={Styles.row}>
            <td className={Styles.td}><span className={Styles.code}>{r.ItemCode || '-'}</span></td>
            <td className={`${Styles.td} ${Styles.stickyLeft}`}>
              <button onClick={() => handleOnClick(item)} className="text-blue-600 hover:underline font-medium">
                {r.Name || '-'}
              </button>
              <div className={`${Styles.muted}`} style={{marginTop: 2, fontSize: 11}}>{r.DepartName || ''}</div>
            </td>
            <td className={Styles.td}>{r.Pack || '-'}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.QBal)}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.BAL)}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.minPrice)}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.maxPrice)}</td>
            <td className={Styles.td}>
              <span className={`${Styles.pill} ${typeClass(String(r.TyItemDm))}`}>
                <span className={Styles.pillDot} />
                {typeLabel(r.TyItemDm)}
              </span>
            </td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.CostN)}</td>
            <td className={`${Styles.td} ${Styles.num} ${Styles.muted}`}>0.00</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.PriceOffer)}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.CostN)}</td>
            <td className={`${Styles.td} ${Styles.muted}`}>{fmtDate(r.DateCN)}</td>
            <td className={`${Styles.td} ${Styles.num} ${Styles.rightRail}`}>{fmtNum(r.Price)}</td>
            <td className={`${Styles.td} ${Styles.muted}`}>{fmtDate(r.DatePrice)}</td>
            <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.PriceRE)}</td>
            <td className={`${Styles.td} ${Styles.muted}`}>{fmtDate(r.DatePriceRE)}</td>
          </tr>
        );
      }

      // User view
      return (
        <tr key={key} className={Styles.row}>
          <td className={Styles.td}><span className={Styles.code}>{r.ItemCode || '-'}</span></td>
          <td className={`${Styles.td} ${Styles.stickyLeft}`}>
            <button onClick={() => handleOnClick(item)} className="text-blue-600 hover:underline font-medium">
              {r.Name || '-'}
            </button>
            <div className={Styles.muted} style={{marginTop: 2, fontSize: 11}}>{r.DepartName || ''}</div>
          </td>
          <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.QBal)}</td>
          <td className={Styles.td}>
            <button onClick={() => handleOnClick(item)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200">
              {fmtNum(r.Reserve) || '0'}
            </button>
          </td>
          <td className={`${Styles.td} ${Styles.num}`}>{fmtNum(r.BAL)}</td>
          <td className={`${Styles.td} ${Styles.num} ${Styles.rightRail}`}>{fmtNum(r.Price)}</td>
          <td className={Styles.td}>{r.Pack || '-'}</td>
          <td className={`${Styles.td} ${Styles.muted}`}>{fmtDate(r.DatePrice)}</td>
        </tr>
      );
    });
  };

  return (
    <Fragment>
      <div className={`${Styles.container} ${Styles.lightTable}`}>
        <div className={Styles.glass}>
          <div className="overflow-x-auto">
            <table className={`${Styles.table} text-left`}>
              <thead className={Styles.thead}>
                {jsonToken?.StAdmin === '1' ? (
                  <tr>
                    <th className={Styles.th}>ItemCode</th>
                    <th className={Styles.th}>ชื่อผลิตภัณฑ์</th>
                    <th className={Styles.th}>หน่วย</th>
                    <th className={Styles.th}>คงเหลือ</th>
                    <th className={Styles.th}>หักสถานะค้าง</th>
                    <th className={Styles.th}>ทุน MIN</th>
                    <th className={Styles.th}>ทุน Max</th>
                    <th className={Styles.th}>Type</th>
                    <th className={Styles.th}>ทุนล่าสุด</th>
                    <th className={Styles.th}>ราคา PO</th>
                    <th className={Styles.th}>ราคา Offer</th>
                    <th className={Styles.th}>ทุนปรับแต่ง</th>
                    <th className={Styles.th}>วันที่ปรับแต่ง</th>
                    <th className={Styles.th}>ราคาขาย</th>
                    <th className={Styles.th}>วันที่ปรับราคา</th>
                    <th className={Styles.th}>ราคาขาย RE</th>
                    <th className={Styles.th}>วันที่ปรับ</th>
                  </tr>
                ) : (
                  <tr>
                    <th className={Styles.th}>ItemCode</th>
                    <th className={Styles.th}>ชื่อผลิตภัณฑ์</th>
                    <th className={Styles.th}>คงเหลือ</th>
                    <th className={Styles.th}>จอง</th>
                    <th className={Styles.th}>หักสถานะค้าง</th>
                    <th className={Styles.th}>ราคาขาย</th>
                    <th className={Styles.th}>Pack</th>
                    <th className={Styles.th}>วันที่ปรับราคา</th>
                  </tr>
                )}
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          {totalPages > 0 && (
            <div className={`${Styles.footer} px-6 py-4`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    แสดง <span className="text-blue-600 font-bold">{total === 0 ? 0 : (page - 1) * limit + 1}</span>
                    {' '}–{' '}
                    <span className="text-blue-600 font-bold">{Math.min(page * limit, total)}</span>
                  </span>{' '}
                  จาก <span className="text-gray-900 font-bold">{total.toLocaleString()}</span> รายการ
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <span>ก่อนหน้า</span>
                  </button>

                  <div className="hidden sm:flex items-center space-x-1">
                    {renderPageButtons()}
                  </div>

                  <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                    {page} / {totalPages}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <span>ถัดไป</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default ProductTable;
