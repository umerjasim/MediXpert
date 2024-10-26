import globalStore from "../../Store/globalStore";

const CustomLoader = () => {
    return (
      <div className="banter-loader">
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
        <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      </div>
    );
  };
  
  export default CustomLoader;
  