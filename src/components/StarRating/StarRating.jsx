import {fix} from "mathjs"
import { FaStar, FaRegStar} from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";

function StarRating({rating}) {

  const roundedNum = fix(rating)
  let decimal = fix(rating, 1) - roundedNum
  const starArr = [];

  for(let i=0; i < 5; i++){
    const difference = roundedNum - i
    if(difference > 0){
      starArr.push(roundedNum)
    }else{
      starArr.push(decimal)
      decimal = 0;
    }
  }

  console.log(starArr)


  return (
    <div className="flex justify-self-center flex-col">
      <p>{rating}</p>
      <span className="flex">
        {
          starArr.map((num, i) => {
            if(num % 1 == 0 && num != 0) return <FaStar key={i} className="fill-pink-400"/>
            else if (num == 0) return <FaRegStar key={i} className="text-pink-400"/>
            else return <FaRegStarHalfStroke key={i} className="fill-pink-400"/>
          })
        }
      </span>
    </div>
  )
}

export default StarRating
