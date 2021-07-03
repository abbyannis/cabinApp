const resList = document.getElementById('reservation-list');

function deleteReservation(item) {
  deleteData(`/reservation/${item.id}`)
  .then(res => {
    if(res >= 200 && res < 300) {
      let li = item.closest("li");
      li.parentNode.removeChild(li);
    } else {
      throw new Error('An error occurred on the page: ' + res);
    } 
  })
  .catch(err => {
    console.log(err);
  });
}


resList.addEventListener('click', (event) => {
  if (event.target.nodeName !== 'BUTTON') {
    return;
  }
  deleteReservation(event.target);
})