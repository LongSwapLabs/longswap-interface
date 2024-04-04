import { Button } from "@nextui-org/react";
import { FiArrowLeft } from "react-icons/fi";
import React from "react";
import { useNavigate } from "react-router-dom";

function CardHeaderTitle({title, back}) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between w-full items-center">
      <div className={'w-full'}>
        <Button
          color={'default'}
          variant={'light'}
          size={'sm'}
          isIconOnly
          onClick={() => navigate(back)}
        >
          <FiArrowLeft size={18}/>
        </Button>
      </div>

      <div className={'w-full text-center'}>
        {title}
      </div>

      <div className={'w-full'}/>
    </div>
  )
}

export default CardHeaderTitle