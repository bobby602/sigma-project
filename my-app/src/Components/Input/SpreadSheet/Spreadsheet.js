import React, { useState, useEffect, useRef , useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Selectbox from '../SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubData } from '../../../Store/product-list';
import { Link , useNavigate  } from 'react-router-dom';
import { productActions } from '../../../Store/product-slice';

// import { ProductService } from '../../UI/Table/Service/Service';
import './Spreadsheet.css';

const Spreadsheet = () => {
    const [products1, setProducts1] = useState(null);
    const toast = useRef(null);
    const dispatch = useDispatch();
    const [item,setItem] = useState();
    const [expandedRows, setExpandedRows] = useState(null);
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

    const navigate = useNavigate();
    const goToPosts = (e) =>
      navigate({
        pathname: '/ProductList',
        search:`?itemCode=${e}`,
      });
    const onRowExpand = (e)=>{
      const item = e.data.itemcode;
      const Name = e.data.Name;
      // goToPosts(item);
      // dispatch(fetchSubData(item));
      // setItem(product.subTable);
    }
    useEffect(()=>{
      console.log('a')
    },[item])
    
    
    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        //   if (newValue.trim().length > 0)
        //       rowData[field] = newValue;
        //   else
        //       event.preventDefault();
        // }
    }
    const rowExpansionTemplate = (data) => {
      console.log(data.NewArr)
      return (
          <div className="orders-subtable">
              <h5>Orders for ss</h5>
              <DataTable value={data.NewArr} className ="subTable" responsiveLayout="scroll">
                  <Column field="Code" header="Id" sortable></Column>
                  <Column field="ItemCode" header="Customer" sortable></Column>
                  <Column field="ItemName" header="Date" sortable></Column>
                  <Column field="Name" header="Amount" ></Column>
                  <Column field="Pack" header="Status"  ></Column>
                  <Column field="Qty" header="Status"  ></Column>
              </DataTable>
          </div>
      );
  }

    const cellEditor = (options) => {  
      return textEditor(options);
    }

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    }

    return (
      <div className="datatable-rowexpansion-demo">
            <Toast ref={toast} />

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <DataTable 
                  value={product.filter} 
                  editMode="cell" 
                  className="editable-cells-table w-full text-sm text-left text-gray-500 dark:text-gray-400 " 
                  rowExpansionTemplate = {rowExpansionTemplate} 
                  responsiveLayout="scroll"
                  onRowExpand={onRowExpand}
                  expandedRows={expandedRows} 
                  onRowToggle={(e) => setExpandedRows(e.data)}
                  >
                    {
                        columns.map(({ field, header }) => {
                            if(field == 'Cost'){
                              return <Column key={field} field={field} header={header} headerStyle={{ width: '6rem'}}  
                                editor={(options) => cellEditor(options)} className = "Cost "   style={{ width: '300px' }}  onCellEditComplete={onCellEditComplete} />
                            }else if (field == 'QBal'){
                              return <Column key={field} field={field} header={header} className = "QBal "   />
                            }else if (field == 'BAL'){
                              return <Column key={field} field={field} header={header} className = "BAL"   />
                            }else if (field == 'minPrice'){
                              return <Column key={field} field={field} header={header} className = "minPrice" />
                            } else if(field == 'maxPrice') {
                              return  <Column key={field} field={field} header={header} className = "maxPrice"   />
                            } else if (field == 'TyItemDm'){
                              return  <Column key={field} field={field} header={header} className = "TyItemDm" />
                            } else if (field == 'itemcode'){
                              return  <Column key={field} field={field} header={header}  className = "itemcode" style={{ display:'none' }}  />
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