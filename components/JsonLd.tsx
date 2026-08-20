/*
  Yapısal veriyi sayfaya gömer. Sunucu bileşeni, istemciye JavaScript taşımaz.
  Google bu etiketi okuyup sayfayı makale/site olarak tanır.
*/
export default function JsonLd({ veri }: { veri: object | object[] }) {
  const liste = Array.isArray(veri) ? veri : [veri]
  return (
    <>
      {liste.map((v, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // </script> kaçışı: içerikte bu dizi geçerse etiketi erken kapatmasın
            __html: JSON.stringify(v).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
