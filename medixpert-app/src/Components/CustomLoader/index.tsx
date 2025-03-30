import globalStore from "../../Store/globalStore";
import logo from "../../Assets/media/images/mx/mx-logo.png"

const CustomLoader = () => {
    return (
      // <div className="banter-loader">
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      //   <div className={`banter-loader__box ${globalStore.darkTheme && 'dark'}`}></div>
      // </div>
      <div className="image-container">
        <img src={logo} alt="Logo" />
        <div className={`loader ${globalStore.darkTheme && 'dark'}`}></div>
      </div>
    );
  };
  
  export default CustomLoader;
  