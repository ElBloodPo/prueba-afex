<template>

<detalle-page @close-modal="modal = false;modal_url_visible = false" :showModal="modal">
  <template v-slot:body>
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="position-relative d-flex">
          <img v-if="!modal_url_visible" v-bind:src="modal_thumbnail" class="w-100 h-100" />
          <div v-if="!modal_url_visible" @click="modal_url_visible = true" class="w-100 h-100 d-flex position-absolute">
            <div class="button-play m-auto">
              <div class="arrow-right m-auto"></div>
            </div>
            <p v-if="!modal_url_visible" class="position-absolute duracion" type="button" >{{modal_duracion}}</p>
          </div>
        </div>
        <iframe allow="autoplay" v-if="modal_url_visible" class="w-100 h-100" frameborder="0" scrolling="no" type="text/html" v-bind:src="modal_url"></iframe>
      </div>
      <div class="col-md-6">
        <h6 class="modal-detalle-title">{{ modal_title }}</h6>
        <p class="modal-detalle-desc">{{ modal_descripcion }}</p>
      </div>
    </div>
  </template>
</detalle-page>

  <div class="main">
    <div class="superior">
      <h4 class="text-start">Añadir nuevo video</h4>
      <div class="d-flex mt-3 anadir">
        <input v-model="linkYoutube" placeholder="Añadir">
        <button @click="anadirLink" type="button">Añadir</button>
      </div>
    </div>

    <div class="videos-list mt-5">
      <div class="row">
        <div class="col-md-4 d-flex position-relative mb-3" v-for="(video,index) in videos" :key="video.id">
          <img @click="viewDetails(index)" v-bind:src="video.thumbnail" class="w-100 h-100 m-auto cursor-pointer">
          <button @click="eliminarVideoPrompt(video.youtube_id,index)" :data-id="video.youtube_id" class="position-absolute cursor-pointer eliminar" type="button">x</button>
          <p class="position-absolute duracion" type="button">{{video.duracion}}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
  import { onMounted, ref, inject } from 'vue'
  import DetallePage from './components/DetallePage.vue'

  const swal = inject('$swal')
  const URL_AWS = "https://6cye29dbse.execute-api.us-east-1.amazonaws.com/dev";

  let linkYoutube = "";
  const videos = ref(null);
  var modal = ref(false);
  let modal_title = "";
  let modal_descripcion = "";
  let modal_url = "";
  let modal_url_visible = ref(false);
  let modal_thumbnail = "";
  let modal_duracion = "";


  function getVideos() {
    fetch(URL_AWS+'/videos/get')
    .then(function(response) {
      return response.json()
    })
    .then(function(data) {
        videos.value = data.videos
    }).catch(err => {
      console.log(err);
      swal({
        title:"Lo sentimos, ocurrio un error",
        toast:true,
        position:'top',
        showConfirmButton:false,
        timer:3000,
        icon:'error'
      })
    });
  }

  function eliminarVideo(youtube_id,index) {
    fetch(URL_AWS+'/videos/eliminar',
    { 
      method:'POST',
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({youtube_id:youtube_id})
    })
    .then(function(response) {
      return response.json()
    })
    .then(function(data) {
        if(data.estado == 200) {
          //
          var videos_array = videos.value
          videos_array.splice(index,1)
          videos.value = videos_array
          swal({
            title:"Video eliminado de la biblioteca correctamente",
            toast:true,
            position:'top',
            showConfirmButton:false,
            timer:3000,
            icon:'success'
          })
        }
    }).catch(err => {
      console.log(err);
      swal({
        title:"Lo sentimos, ocurrio un error",
        toast:true,
        position:'top',
        showConfirmButton:false,
        timer:3000,
        icon:'error'
      })
    });
  }

  function eliminarVideoPrompt(youtube_id,index) {
    swal({
        title: '¿Seguro que quieres eliminar este video?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons:true,
        showCloseButton:true,
        scrollbarPadding:false,
        confirmButtonColor:'#136ae4',
        cancelButtonColor:'#fff',
        customClass:{
          cancelButton:'m-cancelButton',
          confirmButton:'m-confirmButton',
          closeButton:'m-closeButton',
          title:'m-title',
          popup:'m-dialog',
          actions:'m-actions'
        }
      }).then((r) => {
        if(r.isConfirmed) eliminarVideo(youtube_id,index)
      });
  }

  function validarLink() {
    if(!linkYoutube.includes("youtube.com") && !linkYoutube.includes("youtu.be"))  
      return false;
    
    if(linkYoutube.includes("youtu.be")) {
      if(linkYoutube.includes("youtu.be/-")) return linkYoutube.split("youtu.be/-")[1]
      else if(linkYoutube.includes("&")) return linkYoutube.split("youtu.be/")[1].split("&")[0]
      else if(linkYoutube.includes("?")) return linkYoutube.split("youtu.be/")[1].split("?")[0]
      return false;
    } else if(linkYoutube.includes("youtube.com")) {
      if(linkYoutube.includes("watch?v=")) return linkYoutube.split("watch?v=")[1].split("&")[0]
      else if(linkYoutube.includes("/?v=")) return linkYoutube.split("/?v=")[1].split("&")[0]
      else if(linkYoutube.includes("watch?feature=") || linkYoutube.includes("watch?app=")) return linkYoutube.split("&v=")[1].split("&")[0]
      else if(linkYoutube.includes("/v/-")) return linkYoutube.split("/v/-")[1].split("?")[0]
      else if(linkYoutube.includes("/v/")) return linkYoutube.split("/v/")[1].split("?")[0]
      else if(linkYoutube.includes("/attribution_link?")) return linkYoutube.split("v%3D")[1].split("%26")[0]
      else if(linkYoutube.includes("/embed/")) return linkYoutube.split("/embed/")[1].split("?")[0]
      else if(linkYoutube.includes("/e/")) return linkYoutube.split("/e/")[1].split("?")[0]
      return false;
    }
  }

  function anadirLink() {
    var id = validarLink();
    if(!id) {
      swal({
        title:"El link del video de youtube no es válido",
        toast:true,
        position:'top',
        showConfirmButton:false,
        timer:3000,
        icon:'warning'
      })
      return false;
    }
    
    fetch(URL_AWS+'/videos/anadir',
    { 
      method:'POST',
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({youtube_id:id})
    })
    .then(function(response) {
      return response.json()
    })
    .then(function(data) {
        if(data.estado == 200) {
          swal({
            title:"Video agregado a la biblioteca correctamente",
            toast:true,
            position:'top',
            showConfirmButton:false,
            timer:3000,
            icon:'success'
          })
          var videos_array = videos.value
          videos_array.push(data.video)
          videos.value = videos_array
        } else if(data.estado == 404) {
          swal({
            title:"El video no existe",
            toast:true,
            position:'top',
            showConfirmButton:false,
            timer:3000,
            icon:'warning'
          })
        } else if(data.estado == 500) {
          swal({
            title:"El video ya se encuentra en la biblioteca",
            toast:true,
            position:'top',
            showConfirmButton:false,
            timer:3000,
            icon:'warning'
          })
        }
    }).catch(err => {
      console.log(err);
      swal({
        title:"Lo sentimos, ocurrio un error",
        toast:true,
        position:'top',
        showConfirmButton:false,
        timer:3000,
        icon:'error'
      })
    });

  }

  function viewDetails(index) {
    modal_url = "";
    modal_title = videos.value[index].nombre;
    modal_thumbnail = videos.value[index].thumbnail;
    modal_duracion = videos.value[index].duracion;
    modal_url = 'https://www.youtube.com/embed/'+videos.value[index].youtube_id+'?autoplay=1&fs=0&showinfo=0&rel=0'
    modal_descripcion = videos.value[index].descripcion;
    modal.value = true
  }

  // lifecycle hooks
  onMounted(() => {
    getVideos();

  })
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

@import "./assets/css/main.css"
</style>
