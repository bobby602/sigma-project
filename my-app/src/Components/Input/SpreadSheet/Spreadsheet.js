import React, { useState, useEffect, useRef , useCallback, Fragment } from 'react';
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
import 'antd/dist/antd.min.css';
// import { ProductService } from '../../UI/Table/Service/Service';
import  './Spreadsheet.css';


const Spreadsheet = () => {
    const [products1, setProducts1] = useState(null);
    const toast = useRef(null);
    const dispatch = useDispatch();
    const [subTable,setSubTable] = useState('');
    const [item,setItem] = useState();
    const [expandedRows, setExpandedRows] = useState(null);
    const product = useSelector((state) => state.product);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState('');

    // const columns = [
    //     { field: 'expan'},
    //     { field: 'itemcode', header: 'Itemcode' },
    //     { field: 'Name', header: 'ชื่อผลิตภัณฑ์' },
    //     { field: 'QBal', header: 'คงเหลือ' },
    //     { field: 'BAL', header: 'หักสถานะค้างต่างๆ' },
    //     { field: 'minPrice', header: 'ทุน MIN' },
    //     { field: 'maxPrice', header: 'ทุน Max' },
    //     { field: 'Cost' , header:'ทุนปัจุบัน'},
    // ];
  
    const expandedRowRender = (record) => {
      console.log(record.NewArr)
      const subColumns = [
        {
          title: 'รหัส',
          dataIndex: 'ItemCode',
          key: 'ItemCode',
        },
        {
          title: 'ชื่อ',
          dataIndex: 'Name',
          key: 'Name',
        },
        {
          title: 'Qty',
          dataIndex: 'Qty',
          key: 'Qty',
        },
        {
          title: 'หน่วย',
          dataIndex: 'Pack',
          key: 'Pack',
        },
        {
          title: 'ทุนหน่วย',
          key: 'CostUnit',
        },
        {
          title: 'มูลค่า',
          key: 'Value',
        }
      ];
    } 
    const columns = [
      {
        title: 'Itemcode',
        dataIndex: 'itemcode',
        key: 'itemcode',
      },
      {
        title: 'ชื่อผลิตภัณฑ์',
        dataIndex: 'Name',
        key: 'Name',
      },
      {
        title: 'คงเหลือ',
        dataIndex: 'QBal',
        key: 'QBal',
      },
      {
        title: 'หักสถานะค้างต่างๆ',
        dataIndex: 'BAL',
        key: 'BAL',
      },
      {
        title: 'ทุน MIN',
        dataIndex: 'minPrice',
        key: 'minPrice',
      },
      {
        title: 'ทุน Max',
        dataIndex: 'maxPrice',
        key: 'maxPrice',
      },
      {
        title:'ทุนปัจจุบัน',
        dataIndex: ''
      }
    ];

    const onExpand = (e,record)=>{
      setSubTable(record);
    }
    const navigate = useNavigate();
    // const goToPosts = (e) =>
    //   navigate({
    //     pathname: '/ProductList',
    //     search:`?itemCode=${e}`,
    //   });
    // const onRowExpand = (e)=>{
    //   const item = e.data.itemcode;
    //   const Name = e.data.Name;
      // goToPosts(item);
      // dispatch(fetchSubData(item));
      // setItem(product.subTable);
    // }
    useEffect(() => {
      setLoading(true);
      if(product.filter !== null){
        setLoading(false);
      }
    }, [product]);

    const dataSource = [];
    for (let i = 0; i < product.filter.length; i++) {
      dataSource.push({
        ...product.filter[i],
        key: i
    });
}



    // const onCellEditComplete = (e) => {
    //     let { rowData, newValue, field, originalEvent: event } = e;
        //   if (newValue.trim().length > 0)
        //       rowData[field] = newValue;
        //   else
        //       event.preventDefault();
        // }
    // }
  //   const rowExpansionTemplate = (data) => {
  //     return (
  //         <div className="orders-subtable">
  //             <h5>Orders for ss</h5>
  //             <DataTable value={data.NewArr} className ="subTable" responsiveLayout="scroll">
  //                 <Column field="Code" header="Id" sortable></Column>
  //                 <Column field="ItemCode" header="Customer" sortable></Column>
  //                 <Column field="ItemName" header="Date" sortable></Column>
  //                 <Column field="Name" header="Amount" ></Column>
  //                 <Column field="Pack" header="Status"  ></Column>
  //                 <Column field="Qty" header="Status"  ></Column>
  //             </DataTable>
  //         </div>
  //     );
  // }

    // const cellEditor = (options) => {  
    //   return textEditor(options);
    // }

    // const textEditor = (options) => {
    //     return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    // }

    return (
          <Fragment>
              {/* <Table className = {`.datatable w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg `} columns={columns} dataSource={dataSource}  scroll={{
      x: 1300,
    }} pagination={false} expandedRowRender={expandedRowRender}  expandedRowKeys={[expandedRow]}  onExpand={(isExpanded, record) =>
            // console.log(record.itemcode)
            setExpandedRow(isExpanded ? record.key : undefined)
          } /> */}
          </Fragment>
    );
}

export default Spreadsheet;

 // <div className="datatable-rowexpansion-demo">
      //       <Toast ref={toast} />

      //       <div className=" card relative  shadow-md sm:rounded-lg">
      //           <DataTable 
      //             value={product.filter} 
      //             editMode="cell" 
      //             className="text-base text-left text-gray-500 dark:text-gray-400 " 
      //             rowExpansionTemplate = {rowExpansionTemplate} 
      //             expandedRows={expandedRows} 
      //             onRowToggle={(e) => setExpandedRows(e.data)}
      //             loading={loading}
      //             responsiveLayout="flex"
                  // scrollDirection="both" 
                  // scrollDirection="both"
                  // >
              {/* <Column key='itemcode' field='Itemcode' header='Itemcode'  
                      editor={(options) => cellEditor(options)} className = "Cost " onCellEditComplete={onCellEditComplete}/>
              <Column key='Name' field='Name' header='Name' className = "QBal"/>
              <Column key='itemcode' field='itemcode' header='Itemcode' className = "BAL"/>
              <Column key='itemcode' field='itemcode' header='Itemcode' className = "minPrice" />
              <Column key='itemcode' field='itemcode' header='Itemcode' className = "maxPrice" />
              <Column key='itemcode' field='itemcode' header='Itemcode' className = "TyItemDm" />
              <Column key='itemcode' field='itemcode' header='Itemcode'  className = "itemcode" style={{ display:'none' }}  /> */}
                    
        //             {
        //                 columns.map(({ field, header }) => {

        //                     if(field == 'Cost' &&(product.type.includes('3')||product.type.includes('4'))){
        //                       return <Column key={field} field={field} header={header}  
        //                         editor={(options) => cellEditor(options)} className = "Cost "  onCellEditComplete={onCellEditComplete}/>
        //                     }else if (field == 'QBal'){
        //                       return <Column key={field} field={field} header={header}   className = "QBal "/>
        //                     }else if (field == 'BAL'){
        //                       return <Column key={field} field={field} header={header}    className = "BAL"/>
        //                     }else if (field == 'minPrice'){
        //                       return <Column key={field} field={field} header={header}   className = "minPrice"/>
        //                     } else if(field == 'maxPrice') {
        //                       return  <Column key={field} field={field} header={header}   className = "maxPrice"/>
        //                     } else if (field == 'TyItemDm'){
        //                       return  <Column key={field} field={field} header={header}   className = "TyItemDm "/>
        //                     } else if (field == 'itemcode'){
        //                       return  <Column key={field} field={field} header={header}  style={{ display:'none'  }}  className = "itemcode"  />
        //                     }else if(field == 'Name'){
        //                       return (
        //                             <Column key={field} field={field} header={header}  className = "name"  frozen />
        //                       )
        //                     }else if (field == 'expan'){
        //                       return  <Column key={field} expander  />
        //                     }

        //                 })
        //             }
        //         </DataTable>
        //     </div>
        //  </div>