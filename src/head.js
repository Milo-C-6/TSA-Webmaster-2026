// "On page load or when changing themes, best to add inline in `head` to avoid FOUC" thanks tailwindcss, didn't know much about this
document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);

function createNavBar() { // Slightly useful to have it in so I can 
    switchImage = "/src/media/sun.svg";
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        switchImage = "/src/media/moon.svg";
    }

    const navElem = document.createElement("nav");
    navElem.classList.add("sticky", "top-0", "bg-white/70", "dark:bg-black/70", "p-2", "flex", "justify-between", "items-center");
    const navBarContent = `<a href="/index.html"><img alt="Logo" src="/src/media/logo.webp" class="h-10"></a>
    <div class="hologram flex justify-between items-center gap-15 p-1 pl-20 my-1 pr-20 text-white rounded-2xl backdrop-blur-2xl">
    <!--still feeling slightly iffy about the hologram background, not sure how I would improve it though...-->
    <a href="/index.html">Home</a>
    <a href="/resources.html">Resources</a>
    <a href="/timeline.html">Timeline</a>
    <a href="/events.html">Events</a>
    <a href="/reference.html">Reference</a>
    <a class="h-6 w-6" title="Right click for context menu" href="javascript:void(0)" id="themeToggle"><img style="height: 100%;" src="${switchImage}"></a>
    </div>`;
    navElem.innerHTML = navBarContent;
    document.body.append(navElem);
}