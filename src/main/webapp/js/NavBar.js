'use strict';

const NavBar = function NavBar(items, container, clearContainer) {
    
    //remove container children elements
    if(clearContainer) {
        while(container.firstChild)
            container.removeChild(container.firstChild);
    }
    
    
    //create dropdown
    let createMenu = function createMenu(clas) {
        let ul = document.createElement('ul');
        if(clas) ul.className = clas;
        return ul;
    }
    
    let createItem = function createItem(item, parent) {
        let li = document.createElement('li');
        
        let a = document.createElement('a');
        //add icon
        let icon = '';
        if(item.clas) icon = '<i class="' + item.clas + '"></i> ';
        a.innerHTML = icon + item.text;
        if(item.onClick) a.onclick = item.onClick;
        
       
        //add option
        li.appendChild(a);
        
        if(item.items != null) { //build submenu
            let ul = createMenu();
            for(let i=0; i<item.items.length; ++i) createItem(item.items[i], ul);
            //add submenu to parent menu
            li.appendChild(ul);
        }
        
        parent.appendChild(li);
    }
    
    //init - build menu and items
    let menu = createMenu('menu');
    for(var i=0; i<items.length; ++i) createItem(items[i], menu);
    
    //add menu to container
    container.appendChild(menu);
    
            
    //adjust in center
    setTimeout(function ajdust() { //after rendering
        let width = 10;
        let children = menu.children;
        for(let i=0; i<children.length; ++i) width += children[i].offsetWidth;
        menu.style = "width: " + width + "px";
    }, 100);
}