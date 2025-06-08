export default class AboutPage {
  async render() {
    return `
    <section class="px-4 py-20 bg-white text-center">
      <div class="container mx-auto max-w-5xl">
        <h1 class="text-4xl font-bold text-blue-700 mb-6">Tentang Segarikan</h1>
        <p class="text-gray-700 text-lg mb-10 leading-relaxed text-balance">
          <strong>Segarikan</strong> adalah sebuah platform berbasis web yang memanfaatkan teknologi <span class="text-blue-600 font-medium">Artificial Intelligence</span> untuk mendeteksi tingkat kesegaran ikan secara cepat dan akurat. Aplikasi ini dikembangkan sebagai solusi atas masalah pemborosan pangan, khususnya di sektor perikanan.
        </p>
  
        <div class="grid md:grid-cols-2 gap-12 text-left">
          <div>
            <h2 class="text-2xl font-semibold text-blue-700 mb-3">Misi Kami</h2>
            <p class="text-gray-600 leading-relaxed">
              Kami berkomitmen untuk membantu masyarakat mengenali ikan segar dengan mudah demi meningkatkan keamanan pangan dan mengurangi limbah makanan di Indonesia. Segarikan hadir untuk mendorong konsumsi ikan yang lebih cerdas, sehat, dan berkelanjutan.
            </p>
          </div>
  
          <div>
            <h2 class="text-2xl font-semibold text-blue-700 mb-3">Teknologi yang Digunakan</h2>
            <ul class="list-disc ml-5 text-gray-600 space-y-2">
              <li>Model AI menggunakan TensorFlow & Transfer Learning</li>
              <li>Pengolahan gambar menggunakan OpenCV</li>
              <li>Frontend dengan HTML, Tailwind CSS, JavaScript</li>
              <li>Backend menggunakan Node.js + Express + IndexDB</li>
            </ul>
          </div>
        </div>
  
       <div class="mt-16">
  <h2 class="text-2xl font-semibold text-blue-700 mb-6">Tim Pengembang</h2>
  <div class="grid md:grid-cols-3 gap-6">
    ${[
      {
        name: "Novi Setiani",
        role: "Machine Learning",
        img: "novi.jpg",
      },
      {
        name: "Danan Rukmana",
        role: "Machine Learning",
        img: "danan.jpeg",
      },
      {
        name: "Dwi Reza Ariyadi",
        role: "Machine Learning",
        img: "reza.jpg",
      },
      {
        name: "Gemi Yudhia",
        role: "Frontend & Backend",
        img: "gemi.jpeg",
      },
      {
        name: "Berliandi Putra",
        role: "Frontend & Backend",
        img: "berliandi.jpeg",
      },
      {
        name: "Bagas Gilang Ramadhan",
        role: "Frontend & Backend",
        img: "bagas.jpg",
      },
    ]
      .map(
        (member) => `
      <div class="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
        <img src="${member.img}" alt="${member.name}" class="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-blue-200 object-cover">
        <h3 class="text-blue-700 font-semibold text-lg">${member.name}</h3>
        <p class="text-gray-600 text-sm">${member.role}</p>
      </div>
    `
      )
      .join("")}
  </div>
</div>

      </div>
    </section>
  `;
  }

  async afterRender() {
    // Do your job here
  }
}
