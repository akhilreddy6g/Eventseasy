export default function MessageCard({
    containerKey,
    username,
    message,
    timestamp,
    orientation
  }: {
    containerKey: string
    username: string;
    message: string;
    timestamp: string;
    orientation: number
  }) {
    return (
      <div key={"MessageCardContainer"+containerKey} className={`flex ${orientation=== 0 ? "justify-start" : "justify-end"} w-full px-2`}>
      { orientation === 0 ?
          <div key={"MessageCard"+containerKey} className="flex items-center space-x-3 w-3/4 justify-start">
            <div className="flex-shrink-0 bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-col w-fit items-start justify-start">
                <p className="mt-3 p-2 w-fit text-gray-700 bg-white shadow-lg rounded-2xl border border-gray-200 text-justify">{message}</p>
                <div className='flex justify-between w-full p-2'>
                  <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
                  <p className="text-sm text-gray-500">{timestamp}</p>
                </div>
              </div>
            </div>
          </div>
          : 
          <div key={"MessageCard"+containerKey} className="flex items-center space-x-3 w-3/4 justify-end">
            <div>
            <div className="flex flex-col w-fit items-end justify-end">
              <p className="mt-3 p-2 w-fit text-gray-700 bg-white shadow-lg rounded-2xl border border-gray-200 text-justify">
                {message}
              </p>
              <div className="flex justify-between w-full p-2">
                <p className="text-sm text-gray-500">{timestamp}</p>
                <h4 className="font-semibold text-gray-800 min-w-min">{username}</h4>
              </div>
            </div>
            </div>
            <div className="flex-shrink-0 bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center text-gray-700 font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
      }
      </div>
    );
  }