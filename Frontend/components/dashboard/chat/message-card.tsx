export default function MessageCard({
    containerKey,
    username,
    message,
    timestamp,
    orientation,
    prev,
    last
  }: {
    containerKey: string
    username: string,
    message: string,
    timestamp: string,
    orientation: number,
    prev: boolean,
    last: boolean
  }) {
    return (
      <div key={"MessageCardContainer"+containerKey} className={`flex ${orientation=== 0 ? "justify-start" : "justify-end"} w-full px-2 ${last && "pb-2"}`}>
      { orientation === 0 ?
          <div key={"MessageCard"+containerKey} className={`flex items-center space-x-3 w-3/4 pl-2 ${prev && 'pt-1'} justify-start`}>
            <div className="flex flex-col">
              {!prev && <div className='flex justify-between w-full p-2'>
                <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
              </div>}
              <div className="flex gap-2 items-center">
                <div className={`flex-shrink-0  ${!prev && "bg-gray-300"} h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold`}>
                  {!prev && username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col w-fit items-start justify-start">
                  <p className={`p-2 w-fit text-gray-700 bg-white shadow-md rounded-2xl border border-gray-200 text-justify`}>{message}</p>
                </div>
                <div className="flex flex-col flex-1 justify-end">
                  <p className="text-xs text-gray-500">{timestamp}</p>
                </div>
              </div>
            </div>
          </div>
          : 
          <div key={"MessageCard"+containerKey} className={`flex items-center space-x-3 w-3/4 pl-2 ${prev && 'pt-1'} justify-end`}>
            <div className="flex flex-col">
            {!prev && <div className='flex justify-end w-full p-2'>
                <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
            </div>}
            <div className="flex gap-2 items-center">
              <div className="flex flex-col flex-1 justify-end">
                <p className="text-xs text-gray-500">{timestamp}</p>
              </div>
              <div className="flex flex-col w-fit items-end justify-end">
                <p className="p-2 w-fit text-gray-700 bg-white shadow-md rounded-2xl border border-gray-200 text-justify">{message}</p>
                </div>
              <div className={`flex-shrink-0  ${!prev && "bg-gray-300"} h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold`}>
                {!prev && username.charAt(0).toUpperCase()}
              </div>
            </div>
            </div>
          </div>
      }
      </div>
    );
  }