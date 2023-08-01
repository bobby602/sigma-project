import styles from './CardList.module.css'
import react,{Fragment} from 'react';


const CardList = (prop)=>{
    let date = '';
    const toThaiDateString =  (date)=> {
        let monthNames = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
                "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม.",
                "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                        ];
        let year = date.getFullYear() + 543;
        let month = monthNames[date.getMonth()];
        let numOfDay = date.getDate();
        return `วันที่ ${numOfDay} ${month} ${year} `;
    }
    let date1 = new Date();
    date = toThaiDateString(date1);

    const list = prop.listName.link.map((a,num)=>{
        return (
            <li key ={num}>
                <a href={prop.listName.link[num][1]} className={`${styles.reportlist} content-center`}>
                    <span className="flex-1 py-12 ml-3 whitespace-nowrap content-center">{prop.listName.link[num][0]}</span> 
                    <button type="button" className=" ml-4 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 ">Next</button>
                </a>
            </li>
            )
        }) 

    return (
            <Fragment>
                <div className={`${styles.cardHeight}  `}> 

                            <img src={process.env.PUBLIC_URL + "/icons/S__55869455-removebg-preview.png"} className="rounded py-2 mx-auto z-0 d-block" alt="..."width="300" height="300"/> 
                                <p className={`my-5  text-center text-base font-semibold text-gray-900 ${styles.text} dark:text-white`}>
                                    {date} 
                                </p>
                                <h1 className = "text-4xl leading-loose text-center mb-5">Welcome to Sigma Group Thailand</h1>
                                {
                                    prop.saleMenu?  
                                     <h2 className= "text-4xl leading-loose text-center ">{prop.saleMenu.Name} {prop.saleMenu.SurName}</h2>
                                     :''
                                }
                                <div className ={`${styles.report_box}`}>  
                                    <p className = "text-3xl text-left leading-4 text-green-600"><strong>{prop.listName.menu[0]}</strong></p>
                                    <div className ={`${styles.reportnumlist}`}>
                                        <ol>
                                            {list}
                                        </ol>
                                    </div>    
                                </div>    
                        {/* </div>         */}
                </div>    
            </Fragment>
            )
}
export default CardList;