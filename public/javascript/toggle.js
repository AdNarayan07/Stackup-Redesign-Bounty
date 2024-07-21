function run(){
    const htmlElement = document.getElementsByTagName('html')[0];
    const themeCheckbox = document.getElementById("theme");
    const isDarkModeStored = localStorage.getItem('isDarkMode') === "true";
    
    if (isDarkModeStored) {
        htmlElement.classList.add('dark');
        themeCheckbox.checked = true;
    } else {
        htmlElement.classList.remove('dark');
        themeCheckbox.checked = false;
    }
    
    document.getElementById("toggle").addEventListener("click", () => {
        const isDarkMode = !themeCheckbox.checked;
        themeCheckbox.checked = isDarkMode;
        localStorage.setItem('isDarkMode', isDarkMode);
        htmlElement.classList.toggle('dark', isDarkMode);
    });
}
run()