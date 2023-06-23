import Styles from './Modal.module.css'
const Modal = (props)=>{
    console.log(props);
    const handleCancelPopUp = ()=>{
        props.setModalOn(false);
    }
    return (
        <div id="authentication-modal"  aria-hidden="true" className="bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto overflow-x-hidden fixed top-10 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full sm:h-auto">
            <div className="relative mt-10 p-4 w-full max-w-4xl h-full md:h-auto sm:h-[300px]">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700  md:h-full sm:h-full">
                <button type="button"  onClick= {handleCancelPopUp} className="absolute top-10 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-Rule="evenodd"></path></svg>  
                </button>
                <div className="py-6 px-6 lg:px-8  md:h-auto sm:h-auto ">
                    {props.children}
                </div>
            </div>
        </div>
    </div> 
  
    )
}
export default Modal;