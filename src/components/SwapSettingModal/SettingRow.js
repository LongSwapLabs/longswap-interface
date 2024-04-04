import { Button, ButtonGroup } from "@nextui-org/react";

function SettingRow({icon, label, value, options, onChange, symbol = '%'}) {
  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'text-sm flex gap-1 items-center'}>
        {icon}
        <span className={'text-slate-600'}>{label}</span>
      </div>
      <div className={'flex gap-2'}>
        <ButtonGroup className={'w-2/3 flex justify-center items-center'}>
          {
            options.map(option => (
              <Button
                key={option}
                color={value === option ? 'primary' : 'default'}
                radius={'md'}
                className={'py-1 px-2 min-w-0 w-full'}
                variant={'flat'}
                onClick={() => onChange(option)}
              >
                {option}
              </Button>
            ))
          }
        </ButtonGroup>

        <div className={'w-1/3 py-1 px-2.5 border-1 rounded-medium flex justify-center items-center gap-1'}>
          <input
            className={'outline-none text-right w-full'}
            placeholder={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {symbol}
        </div>
      </div>
    </div>
  )
}

export default SettingRow