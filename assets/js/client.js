document.addEventListener("DOMContentLoaded", () => {
  new Mmenu("#navmenu", { 
    extensions: ["theme-black", "fx-menu-slide", "pagedim-black"]
  , counters: true
  , iconbar: {
      use: true
    , top: [
        "<a href='#/'><i class='fa fa-home'></i></a>" // ok
      , "<a href='#/'><i class='fa fa-user'></i></a>" // ok
      ]
    , bottom: [
        "<a href='#/'><i class='fab fa-twitter'></i></a>"
      , "<a href='#/'><i class='fab fa-facebook-f'></i></a>"
      , "<a href='#/'><i class='fab fa-linkedin-in'></i></a>"
      ]
    }
  , iconPanels: true
  , navbars: [ 
      { 
         "position": "top", "content": ["prev", "title"]
      }
    , { 
        "position": "bottom", "content": [
          "<a class='fas fa-envelope' href='#/'></a>"   // ok
        , "<a class='fab fa-twitter' href='#/'></a>"    // ok
        , "<a class='fab fa-facebook-f' href='#/'></a>" // ok
        ]
      }
    ]
  , sidebar: { collapsed: "(min-width: 640px)", expanded: "(min-width: 1200px)" }
  });
});

