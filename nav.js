(function(){
  var n=document.querySelector(".asn");if(!n)return;
  var m=n.querySelector(".asn-more"),b=m&&m.querySelector("button");
  if(b){b.addEventListener("click",function(e){e.stopPropagation();var o=m.classList.toggle("open");b.setAttribute("aria-expanded",o);});
    document.addEventListener("click",function(e){if(!m.contains(e.target)){m.classList.remove("open");b.setAttribute("aria-expanded","false");}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){m.classList.remove("open");b.setAttribute("aria-expanded","false");}});}
  var bg=n.querySelector(".asn-burger");
  if(bg)bg.addEventListener("click",function(){var o=n.classList.toggle("open");bg.setAttribute("aria-expanded",o);bg.setAttribute("aria-label",o?"Close menu":"Open menu");});
  // Signed-in state for pages without their own handler
  var a=n.querySelector("a.asn-signin[data-auto]");
  if(a){try{var raw=localStorage.getItem("sb-qxlmqxslpwqbrisywzsp-auth-token");if(!raw)return;var s=JSON.parse(raw);s=s&&(s.currentSession||s);var u=s&&s.user;if(!u||!s.refresh_token)return;
    var md=u.user_metadata||{};a.textContent="";a.classList.add("me");
    if(md.avatar_url){var i=document.createElement("img");i.src=md.avatar_url;i.alt="";i.referrerPolicy="no-referrer";a.appendChild(i);}
    a.appendChild(document.createTextNode("Dashboard"));}catch(e){}}
})();
