const FETCH_URL = "/user/properties"
const propertyList = document.getElementById('property-list');

function loadPage(properties) {
  if (properties.length > 0) {
    propertyList.innerHTML =   
      properties
        .map(x => {
          return `<li class='selectable-list-item' data-property=${x._id}>
            <div>${x. name}</div>
            <div class='alt-text'>${x.location}</div>
          </li>`
        })
        .join('');
  } else {
    propertyList.innerHTML = "You are not currently a member of any properties."
  }
}

function loadProperties() {  
  fetch(FETCH_URL)
  .then(result => {
    return result.json();
  })
  .then(res => {    
    console.log(res); 
    loadPage(res.properties);        
  })
  .catch(err => console.log(err));
}

function selectProperty(event) {
  const box = event.target.closest('li');
  if (box.dataset.property) {   
   alert(box.dataset.property);   
 }
 event.stopPropagation();
}

window.addEventListener("load", loadProperties);
propertyList.addEventListener("click", selectProperty, false);