
const url = 'https://gklikyemhahjgjcqkwja.supabase.co/auth/v1/health';
console.log('Testando fetch para:', url);

fetch(url)
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', JSON.stringify([...res.headers], null, 2));
    return res.text();
  })
  .then(text => console.log('Corpo:', text))
  .catch(err => {
    console.error('Erro detalhado:', err);
    if (err.cause) console.error('Causa:', err.cause);
  });
