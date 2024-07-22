function run(){
    const htmlElement = document.getElementsByTagName('html')[0];
    const themeCheckbox = document.getElementById("theme");
    const isDarkModeStored = localStorage.getItem('isDarkMode') === "true"; //reading the saved darkmode setting
    
    if (isDarkModeStored) {
        htmlElement.classList.add('dark');
        themeCheckbox.checked = true;
    } else {
        htmlElement.classList.remove('dark');
        themeCheckbox.checked = false;
    } //setting theme on page load
    
    document.getElementById("toggle").addEventListener("click", () => {
        const isDarkMode = !themeCheckbox.checked; //toggling between themes
        themeCheckbox.checked = isDarkMode;
        localStorage.setItem('isDarkMode', isDarkMode); //saving the setting
        htmlElement.classList.toggle('dark', isDarkMode); //toggling the dark class of html element
    });
}
run()