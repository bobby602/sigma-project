import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Selectbox from '../SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';

// import { ProductService } from '../../UI/Table/Service/Service';
import './Spreadsheet.css';

const Spreadsheet = () => {
    const [products1, setProducts1] = useState(null);
    const toast = useRef(null);
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);

    const columns = [
        { field: 'expan'},
        { field: 'itemcode', header: 'Itemcode' },
        { field: 'Name', header: 'ชื่อผลิตภัณฑ์' },
        { field: 'QBal', header: 'คงเหลือ' },
        { field: 'BAL', header: 'หักสถานะค้างต่างๆ' },
        { field: 'minPrice', header: 'ทุน MIN' },
        { field: 'maxPrice', header: 'ทุน Max' },
        { field: 'Cost' , header:'ทุนปัจุบัน'},
    ];

    // const columns = [
    //     { field: 'code', header: 'Code' },
    //     { field: 'name', header: 'Name' },
    //     { field: 'quantity', header: 'Quantity' },
    //     { field: 'price', header: 'Price' }
    // ];

    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        //   if (newValue.trim().length > 0)
        //       rowData[field] = newValue;
        //   else
        //       event.preventDefault();
        // }
    }
    const rowExpansionTemplate = (data) => {
        console.log(data);
    };

    const cellEditor = (options) => {  
      return textEditor(options);
    }

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    }

    return (
      <div className="datatable-rowexpansion-demo">
            <Toast ref={toast} />

            <div className="card p-fluid">
                <DataTable value={product.filter} editMode="cell" className="editable-cells-table " rowExpansionTemplate = {rowExpansionTemplate} responsiveLayout="scroll">
                    {
                        columns.map(({ field, header }) => {
                          console.log(field)
                            if(field == 'Cost'){
                              return <Column key={field} field={field} header={header} style={{ width: '300px' }} 
                                editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />
                            }else if (field == 'QBal'){
                              return <Column key={field} field={field} header={header} className = "QBal" style={{ width: '300px' }}  />
                            }else if (field == 'BAL'){
                              return <Column key={field} field={field} header={header} className = "BAL" style={{ width: '300px' }}  />
                            }else if (field == 'minPrice'){
                              return <Column key={field} field={field} header={header} className = "minPrice" style={{ width: '300px' }}  />
                            } else if(field == 'maxPrice') {
                              return  <Column key={field} field={field} header={header} className = "maxPrice" style={{ width: '300px' }}  />
                            } else if (field == 'TyItemDm'){
                              return  <Column key={field} field={field} header={header} className = "TyItemDm" style={{ width: '300px' }}  />
                            } else if (field == 'itemcode'){
                              return  <Column key={field} field={field} header={header}  className = "itemcode" style={{ width: '300px',display:'none' }}  />
                            }else if(field == 'Name'){
                              return <Column key={field} field={field} header={header}  style={{ width: '300px' }}  />
                            }else {
                              return  <Column expander style={{ width: "3em" }} />
                            }
                        })
                    }
                </DataTable>
            </div>

           
        </div>
    );
}
export default Spreadsheet;