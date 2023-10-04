$( document ).ready(function() {
    $( '.container-image' ).css( { opacity: '0.4' } );
    $( '.container-form' ).css( { 'margin': '0 0 0 50px', opacity: '1' } );
    createNewPhoto();
});


/**
 * Create a new photo element in the form section
 */
function createNewPhoto() {
    let container_elements = $('<div class="container-elements"/>');
    let divContainer = $( `<div class="containerPhoto"><div><i class='bx bxs-camera camera-icon'>+</i></div></div> `);
    container_elements.append( divContainer );

    let input = $('<input type="file" accept="image/png, image/gif, image/jpeg, image/jpg">');

    $('.photos-container').append( container_elements );

    $( divContainer ).on( 'click', () => {
        $( input ).trigger( 'click' );
    } );

    $( input ).on( 'change', ( e ) => {
        let $this = e.currentTarget;
        let files = $this.files[0];
        chargeimage( files, divContainer, container_elements );
        createNewPhoto();

    } );

    container_elements.on('dragover', function( e ) {
        e.preventDefault();
        $( divContainer ).css( { 'border': '1px solid black', 'opacity': '1' } );
    });

    container_elements.on('dragleave', function( e ) {
        e.preventDefault();
        $( divContainer ).css( { 'border': '2px dashed rgb(27, 27, 27)', 'opacity': '0.4' } );
    });

    container_elements.on('drop', async( e ) => {
        e.stopPropagation();
        e.preventDefault();

        const filesArray = [ ...e.originalEvent.dataTransfer.files]    

        const f = await new Promise(( resolve ) => {
            let fr = new FileReader();
    
            fr.onprogress = ( e ) => {
                if( e.loaded > 50 ) {
                    fr.abort();
                    resolve(true)
                }
            }
    
            fr.onload = () => { resolve(true) }
    
            fr.onerror = () => {  resolve(false)  }
            fr.readAsArrayBuffer( e.originalEvent.dataTransfer.files[ 0 ] )
        });

        if( !f ) {
            console.log('not a file');
        }

        upload( filesArray[0], divContainer, container_elements);

    });
}

/**
 * Upload the image when drop in the content final process to generate the file reader
 * @param {File} file 
 * @param {*} divContainer 
 * @param {*} container_elements 
 */
function upload( file, divContainer, container_elements) {
    let fr = new FileReader();
    
    fr.onload = () => {
        chargeimage( null, divContainer, container_elements, fr.result );
        createNewPhoto();
    }

    fr.readAsDataURL(file);
}

/**
 * Show previsualisation image
 * @param {File} file 
 * @param {*} divContainer 
 * @param {*} container_elements 
 * @param {*} src 
 */
function chargeimage( file, divContainer, container_elements, src ) {
    src = src ? src : URL.createObjectURL(file)
    let img = $( `<img src="${src}" style="width:100%; height:100%">`);
    let $trash = $( '<i class="bx bx-trash trash-icon"></i>');
    divContainer.html( img );
    container_elements.append( $trash )
    $( divContainer ).css( { 'border': '1px solid black', 'opacity': '1' } );

    $( $trash ).on('click', function() {
        $( container_elements ).remove();
    } );
}