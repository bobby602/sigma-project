// import styles from './Card.css'
import  classes from './Card.module.css'

const Card = (props) =>{
    return <div className= {classes.center}>{props.children}</div> ; 
 
}
export default Card;