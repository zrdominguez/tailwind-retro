

const Pages = ({ currentPage, dispatch, fetchGames, pageHistory}) => {

  const visiblePages = [1, 2, 3];

  let lastValue = visiblePages[2];

  if (currentPage > lastValue) {
    visiblePages[0] = currentPage-2;
    visiblePages[1] = currentPage-1;
    visiblePages[2] = currentPage;
  }

  const handleDirectPage = (num) => {
    dispatch(fetchGames({page: num, url: pageHistory[num]}))
  }

  return (
    <div className="flex gap-2 items-center justify-center">

      {visiblePages.map(value => {
        return (
          <p
            key={value}
            onClick={() => handleDirectPage(value)}
            className={`px-3 py-1 rounded ${value === currentPage ? 'bg-blue-500 text-white' : ''}
            hover:cursor-pointer hover:underline`}
          >
            {value}
          </p>
          )
        })
      }
    </div>
  );
};

export default Pages
