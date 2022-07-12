import Styles from './Table.module.css'
import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
const Table = (props)=>{
    return(
        <Fragment>
            <div className={`${Styles.font} relative z-50 overflow-auto shadow-md rounded-lg`}>
                <div className= "overflow-scroll  max-h-[1000px]">
                    <table id="dtHorizontalExample" className=" w-full text-base text-left text-gray-500 dark:text-gray-400">
                        <thead className={`${Styles.textCustom} text-base bg-[#10b981]  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
                            {
                                props.children 
                            }
                        </thead>
                    </table>
                </div>  
            </div>
        </Fragment>
    )
}
export default Table;