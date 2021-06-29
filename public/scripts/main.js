const saveToken = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const formData = JSON.stringify({ email, password });
    fetch('/auth/login', {
        method: 'POST',
        body: formData, 
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
        if(res.status !== 200 && res.status !== 201) {
            throw new Error('Failed')
        }
        // console.log(res.json());
        return res.json();
    })
    .then(resData => {
        console.log(resData.token);
        const path = '/';
        return fetch(path, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + resData.token
            }
        })
        .then(res => {
            window.location.href=path;
        })
        
    })
    .catch(err => {
        console.log(err);
    })
}