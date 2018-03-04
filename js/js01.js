var prota = $( '#protagonist' );
var pIzq = $("#paredIzquierda");
var pArriba = $("#paredArriba");
var pAbajo = $("#paredAbajo");
var pDer = $("#paredDerecha");
var juegoAltura=$("#area").height();
var juegoAnchura=$("#area").width();
var debug=true;
var refreshRate=20;
var protaSpeed=8;
var enemySpeed=10;
var proyectilSpeed=25;
var protaRebote=protaSpeed*1.5;
var randomAltura;
var randomAnchura;
var ultimaTecla=null;
var llaveEncontrada=false;
var nivelActual=1;
var vidas=4;
var oCajas;
var oObstaculos;
var posEnemigo;
var posProta;
var direccionVertical;
var direccionHorizontal;
var diferenciaVertical;
var diferenciaHorizontal;
var moverLeft;
var moverRight;
var moverTop;
var moverDown;
var teclaDisparar;
var delayProyectil=false;
var delayProyectilTime=1000;
var disparar=_.throttle(dispararProyectiles, delayProyectilTime, {trailing: false}); //uso de libreria underscore para no permitir spam de proyectiles haciendo throttling a la funcion
var margenMenu=300;
var matarEnemigoPuntuacion=25;
var subirNivelPuntuacion=125;
var perderVida=_.throttle(actualizarPuntuacionVida, 3000, {trailing: false}); //uso de libreria underscore para no permitir spam de proyectiles haciendo throttling a la funcion
var tiempoNivel=60;
var tiempoNivelCancelar;
var enemigoUltimoMovimiento;
var enemigoUltimoDireccion;
var arrayScores=[];




$(document).ready(function(){
	resizarCampoJuego();
	empezar_juego(nivelActual);
	collisionCajas();
	enemigosMover();
	moverProtagonista(protaSpeed);
	cargarPuntuacion();

	//modal al perder
	$( function() {
		$( "#tabs" ).tabs();
	  } );

	$( "#dialog-confirm" ).dialog({
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		closeOnEscape: false,
		autoOpen: false,
		open: function(event, ui)
		{
			$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
		},
		buttons: {
			Reiniciar: function() {
				reiniciarPartida();
				$( this ).dialog( "close" );
			}
		}
	});

	$( "#dialog-timeOut" ).dialog({
		resizable: false,
		height: "auto",
		width: 400,
		modal: true,
		closeOnEscape: false,
		autoOpen: false,
		open: function(event, ui)
		{
			$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
		},
		buttons: {
			Reiniciar: function() {
				reiniciarNivel();
				$( this ).dialog( "close" );
			}
		}
	});


	
	$(window).on("resize", resizarCampoJuego);
	
	if(debug)
	{
		$("#bloquear").click(function()
		{
			if(enemySpeed>0){
				enemySpeed=0;
				$("#bloquear").text("Permitir movimiento enemigo");
				
			}
			else{
				enemySpeed=nivelActual*10;
				$("#bloquear").text("Bloquear movimiento enemigo");
			}

			$(this).blur();
		});

		$("#avanzar").click(function()
		{
			$("#llave").remove();
			nivelActual+=1;
			empezar_juego(nivelActual);
			$(this).blur();
		});

		$("#perder").click(function()
		{
			$(this).blur();
			vidas=0;
			//$("#dialog-confirm p bold").text(nivelActual);
			//$("#dialog-confirm").dialog("open");
			actualizarPuntuacionVida();
		});
		$("#TimeOut").click(function()
		{
			$(this).blur();
			$("#display #puntuaciones p:first").next().find("span").text(2);
		});
	}
	else
	{
		$("#display #tabs #debug").remove();
		$('#display #tabs ul li a[href^="#deb"]').remove();
	}
	
});

function overlaps(jqDiv1, jqDiv2) {

      var x1 = jqDiv1.offset().left;
      var y1 = jqDiv1.offset().top;
      var h1 = jqDiv1.height();
      var w1 = jqDiv1.width();
      var b1 = y1 + h1;
      var r1 = x1 + w1;
      var x2 = jqDiv2.offset().left;
      var y2 = jqDiv2.offset().top;
      var h2 = jqDiv2.height();
      var w2 = jqDiv2.width();
      var b2 = y2 + h2;
      var r2 = x2 + w2;
        
      if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
      return true;
}

//empezar nivel

function empezar_juego(nivelActual)
{
	//console.log(nivelActual);
	ultimaTecla=null;
	$("#display #puntuaciones p:first").next().find("span").text(tiempoNivel);
	llaveEncontrada=false;
	resetVidas();
	//random altura y anchura dentro del recinto
	randomAnchura=randomLocation(juegoAnchura);
	randomAltura=randomLocation(juegoAltura);
	enemySpeed=nivelActual*10;
	clearTimeout(tiempoNivelCancelar);
	setTiempoNivel();
	//spawn llave aleatoriamente
	var sBananaHtml="<div id='llave' class ><img src='img/Banana.png'/></div>";
	$("#area").append(sBananaHtml);
	do
	{
		var res=false;
		randomAnchura=randomLocation(juegoAnchura);
		randomAltura=randomLocation(juegoAltura);
		$("#llave").css("left", randomAnchura+"px");
		$("#llave").css("top", randomAltura+"px");

		var oDivs=$("#area div:not(#llave)");
		//console.log($(oDivs[1]).position());
		for(var i=0;i<oDivs.length;i++)
		{
			//console.log($(oDivs[i]));
			
			
			if( overlaps( $("#llave"), $(oDivs[i])  ) )
				res=true;
		}

	}while(res);


	$("#llave").css("background-color", "initial");

	//spawn personaje aleatoriamente en diferente posicion que cualquier otro div
	do
	{
		var res=false;
		randomAnchura=randomLocation(juegoAnchura);
		randomAltura=randomLocation(juegoAltura);
		$("#protagonist").css("left", randomAnchura+"px");
		$("#protagonist").css("top", randomAltura+"px");
		

		var oDivs=$("#area div:not(#protagonist)");
		//console.log($(oDivs[1]).position());
		for(var i=0;i<oDivs.length;i++)
		{
			//console.log($(oDivs[i]));
			
			
			if( overlaps( prota, $(oDivs[i])))
				res=true;
		}
	} while(res);

	/*
		Remueve todos los enemigos al empezar un nivel
		Posteriormente crea un nº de enemigos dependiendo del nivel actual
		El nº de enemigos depende del nivel incluso si en un nivel anterior se han destruido enemigos
	*/

	if(oCajas!=null)
		for(var i=0;i<oCajas.length;i++) 
			$(oCajas[i].remove());


	for(var i=0;i<nivelActual;i++) //enemigos
	{
		var sBoxHtml='<div  id="box'+i+'"></div>';
		$("#area").append(sBoxHtml);
		$("#box"+i).addClass("enemigo");
		
		do
		{
			var res=false;
			randomAnchura=randomLocation(juegoAnchura);
			randomAltura=randomLocation(juegoAltura);
			$("#box"+i).css("left", randomAnchura+"px");
			$("#box"+i).css("top", randomAltura+"px");

			var oDivs=$("#area div:not(#box"+i+")"); //no spawneen enemigos encima de otro
			//console.log($(oDivs[1]).position());
			for(var j=0;j<oDivs.length;j++)
			{
				if( overlaps( $("#box"+i), $(oDivs[j])))
					res=true;
			}

		}while(res);
	}

	oCajas=$("#area .enemigo");

	/*
		Los obstaculos son drageables con el ratón, al entrar en un nuevo nivel todas las cajas vuelven a aparecer aleatoriamente
	*/




	if(oObstaculos!=null)
		for(var i=0;i<oObstaculos.length;i++) 
			$(oObstaculos[i].remove());	

	//$("#obstaculo"+nivelActual).css("width", getRandomInt(juegoAnchura/10)+"px");
	//$("#obstaculo"+nivelActual).css("height", getRandomInt(juegoAltura/10)+"px");
	for(var i=0;i<nivelActual;i++)
	{
		var sObstaculoHtml='<div  id="obstaculo'+i+'"></div>';
		$("#area").append(sObstaculoHtml);
		$("#obstaculo"+i).addClass("obstaculo");
		do
		{
			var res=false;
			randomAnchura=randomLocation(juegoAnchura);
			randomAltura=randomLocation(juegoAltura);
			$("#obstaculo"+i).css("left", randomAnchura+"px");
			$("#obstaculo"+i).css("top", randomAltura+"px");
			//console.log($(oObstaculos[i]));

			//no spawneen cajas encima de otra
			var oDivs=$("#area div:not(.obstaculo)");
			for(var j=0;j<oDivs.length;j++)
			{
				if( overlaps( $("#obstaculo"+i), $(oDivs[j])))
					res=true;
			}

		}while(res);
	}
	oObstaculos=$("#area .obstaculo");

	$( function() { //hace todos los obstaculos draggable con el raton.
		for(var i=0;i<oObstaculos.length;i++)
		{
			//console.log($(oObstaculos[i]));
			$(oObstaculos[i]).draggable();
		}
	});

	//puerta
	$("#door").removeClass("puertaA");
	$("#door").addClass("puertaC");
	$("#door").css("top", randomLocation(juegoAltura)+"px");

}


//movimiento del personaje
$(document).keypress(function(tecla)
{
	
	if (tecla.keyCode == 40 || tecla.which == 115) { //down
		moverDown=true;
	    //addClass ya comprueba si tiene la clase por lo que no hay que comprobar
		//protaMov tiene prevalencia con !important sobre protaIdle en css por lo que nos ahorramos removeClass llamada en keydown

		if($("#protagonist").hasClass("protaIdleFlip"))
			$("#protagonist").addClass("protaMov_flip");
		else
			$("#protagonist").addClass("protaMov");

		$("#protagonist").removeClass("protaIdleFlip");
		ultimaTecla=tecla;
		//moverProtagonista(protaSpeed);
	}
	else if(tecla.keyCode == 38 || tecla.which == 119) { //^
		moverTop=true;

		if($("#protagonist").hasClass("protaIdleFlip"))
			$("#protagonist").addClass("protaMov_flip");
		else
			$("#protagonist").addClass("protaMov");

		$("#protagonist").removeClass("protaIdleFlip");
		ultimaTecla=tecla;
		//moverProtagonista(protaSpeed);
	}
	else if(tecla.keyCode == 37 || tecla.which == 97){ //<
		moverLeft=true;
		$("#protagonist").removeClass("protaIdleFlip");
		$("#protagonist").addClass("protaMov_flip");
		ultimaTecla=tecla;
		//moverProtagonista(protaSpeed);
	}
	else if(tecla.keyCode == 39 || tecla.which == 100){ //>
		moverRight=true;
		$("#protagonist").removeClass("protaIdleFlip");
		$("#protagonist").addClass("protaMov");
		ultimaTecla=tecla;
		//moverProtagonista(protaSpeed);
	}
	else if(tecla.which == 32) //disparar
	{
		/* throttle manual que no funciona bien si se deja la tecla pulsada
		setTimeout(function(){
			delayProyectil=false;
		}, delayProyectilTime);

		if(!delayProyectil)
			dispararProyectiles();//solo se puede llamar una vez cada 100 milisegundos
		delayProyectil=true;
		*/
		teclaDisparar=true;	
		
	}

	moverProtagonista(protaSpeed);


	//encontrar llave

	if(!llaveEncontrada && overlaps(prota, $("#llave")))
	{
		//console.log("win");
		$("#llave").remove();
		llaveEncontrada=true;
		//puerta
		$("#door").addClass("puertaA");
		$("#door").removeClass("puertaC");
		//aqui hay que cambiar imagen de puerta cerrada a abierta

	}

	if(llaveEncontrada && overlaps(prota, $("#door")))
	{
		//cambio de nivel, mover al cruzar la puerta
		nivelActual+=1;
		actualizarPuntuaciones(subirNivelPuntuacion);
		empezar_juego(nivelActual);
	}

	if(tecla.keyCode!=116) //f5
		tecla.preventDefault();
	//tecla.stopPropagation();
	
});

$(document).keyup(function(tecla){
    //$("#protagonist img").attr("src", "img/Idle3.png");
	
	
	//console.log(tecla.which);
	if (tecla.keyCode == 40 || tecla.which == 83) { //down
		moverDown=false;
		if($("#protagonist").hasClass("protaMov_flip"))
			$("#protagonist").addClass("protaIdleFlip");
		else
			$("#protagonist").addClass("protaIdle");

		$("#protagonist").removeClass("protaMov");
		$("#protagonist").removeClass("protaMov_flip");
	}
	else if(tecla.keyCode == 38 || tecla.which == 87) { //^
		moverTop=false;

		if($("#protagonist").hasClass("protaMov_flip"))
			$("#protagonist").addClass("protaIdleFlip");
		else
			$("#protagonist").addClass("protaIdle");

		$("#protagonist").removeClass("protaMov");
		$("#protagonist").removeClass("protaMov_flip");
		
	}
	else if(tecla.keyCode == 37 || tecla.which == 65){ //<
		$("#protagonist").removeClass("protaMov");
		$("#protagonist").removeClass("protaMov_flip");
		$("#protagonist").addClass("protaIdleFlip");
		
	    moverLeft=false;
	}
	else if(tecla.keyCode == 39 || tecla.which == 68){ //>
		moverRight=false;
		$("#protagonist").removeClass("protaMov");
		$("#protagonist").removeClass("protaMov_flip");
		$("#protagonist").addClass("protaIdle");
	}
	else if(tecla.which == 32)
		teclaDisparar=false;
});


function collisionCajas()
{

	if(ultimaTecla!=null)
    {
	//otras cajas
		
	    
	    for(var i=0;i<oCajas.length;i++)
	    {
	    	if(overlaps(prota, $(oCajas[i])))
	    	{
	    		//$( '#protagonist' ).stop(false,false);
				//moverAtras();
				perderVida();
	    	}

	    	

		}
		
		for(var i=0;i<oObstaculos.length;i++)
		{
			if(overlaps(prota, $(oObstaculos[i])))
			{
				$( '#protagonist' ).stop(false,false);
	        	moverAtras();
			}
		}
	    

	}

	//paredes
    if(overlaps($( '#protagonist' ), pIzq))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({left: "+="+protaRebote+"px"},1);
       
    }

    else if(overlaps($( '#protagonist' ), pArriba))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({top: "+="+protaRebote+"px"},1); 
    }

    else if(overlaps($( '#protagonist' ), pDer))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({left: "+=-"+protaRebote+"px"},1); 
    }

    else if(overlaps($( '#protagonist' ), pAbajo))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({top: "+=-"+protaRebote+"px"},1); 
    }

    

    setTimeout(collisionCajas, refreshRate);


}

function enemigosMover()
{


	/*comprar left y top de protagonista y enemigo:
	case 1: enemigo.left>prota.left -> planta se mueve hacia la izquierda
	case 2: enemigo.left<prota.left -> planta se mueve hacia la derecha
	case 3: enemigo.top>prota.top -> planta se mueve hacia arriba
	case 4: enemigo.top<prota.top -> planta se mueve hacia abajo
	*/

	posProta=$( '#protagonist' ).position();


	for(var i=0;i<oCajas.length;i++)
    {
		if(overlaps($(oCajas[i]), pIzq))
			{
				$(oCajas[i]).stop(false,false);   
		    	$(oCajas[i]).animate({left: "+="+protaRebote+"px"},1);
			}
			else if(overlaps($(oCajas[i]), pArriba))
		    {
		        $(oCajas[i]).stop(false,false);   
		        $(oCajas[i]).animate({top: "+="+protaRebote+"px"},1); 
		    }

		    else if(overlaps($(oCajas[i]), pDer))
		    {
		        $(oCajas[i]).stop(false,false);   
		        $(oCajas[i]).animate({left: "+=-"+protaRebote+"px"},1); 
		    }

		    else if(overlaps($(oCajas[i]), pAbajo))
		    {
		        $(oCajas[i]).stop(false,false);   
		        $(oCajas[i]).animate({top: "+=-"+protaRebote+"px"},1); 
			}
			// para controlar que los enemigos choquen con obstaculos, demasiada carga a la cpu y hace que sea injugable en 3 o 4 niveles por el numero de enemigos y obstaculos
			
		    else
		    for(var j=0;j<oObstaculos.length;j++)
		    {
		    	if(overlaps($(oCajas[i]), $(oObstaculos[j])))
		    	{
		    		$(oCajas[i]).stop(false, false);
		    		var reboteDireccion;
		    		var reboteDireccion2;
		    		if(enemigoUltimoMovimiento=="top") //vertical
		    		{
		    			reboteDireccion="top";
		    			if(enemigoUltimoDireccion=="arriba")
		    				reboteDireccion2="+=-";
		    			else
		    				reboteDireccion2="+=";
		    		}
		    		else //horizontal
		    		{
		    			reboteDireccion="left";
		    			if(enemigoUltimoDireccion=="der")
		    				reboteDireccion2="+=-";
		    			else
		    				reboteDireccion2="+=";
		    		}
		    		$(oCajas[i]).css(reboteDireccion, reboteDireccion2+(enemySpeed*1.2)+"px");


		    	}
			}

    	posEnemigo=$(oCajas[i]).position();

    	if(posEnemigo.top>posProta.top)
    		direccionVertical="+=-";
    	else
    		direccionVertical="+=";

    	if(posEnemigo.left>posProta.left)
    		direccionHorizontal="+=-";
    	else
    		direccionHorizontal="+=";
    	
    	/*
		Hasta aqui sabemos en que direccion tiene que moverse el enemigo,
		Ahora comparamos left y top y vemos cual es mayor, la que sea mayor tiene prioridad de movimiento
    	*/


    	/* demasiado carga a la cpu y da demasiada homogenidad a los enemigos
		   Se opta por elegir si se movera horizontal o vertical aleatoriamente
    	/*
    	diferenciaVertical=Math.abs(posEnemigo.top-posProta.top);
    	diferenciaHorizontal=Math.abs(posEnemigo.left-posProta.left);

    	if(diferenciaVertical>diferenciaHorizontal)
    		$(oCajas[i]).animate({top : direccionVertical+enemySpeed+"px"});
    	
    	else
    		$(oCajas[i]).animate({left : direccionHorizontal+enemySpeed+"px"});
		
		*/


		
		if(getRandomInt(2)==0)
		{
			$(oCajas[i]).animate({top : direccionVertical+enemySpeed+"px"});
			enemigoUltimoMovimiento="top";
			if(direccionVertical=="+=")
			{
				//console.log("hay que empujar hacia arriba");
				enemigoUltimoDireccion="arriba";
			}
			else
			{
				//console.log("hay que empujar hacia abajo");
				enemigoUltimoDireccion="abajo";
			}	
		}
		else
		{

			$(oCajas[i]).animate({left : direccionHorizontal+enemySpeed+"px"});
			enemigoUltimoMovimiento="left";
			if(direccionHorizontal=="+=")
				enemigoUltimoDireccion="der";
			else
				enemigoUltimoDireccion="izq";
		}

		
			
    }

	//console.log(enemigoUltimoMovimiento);
	

			


    setTimeout(enemigosMover, 1000);
}


//rebote protagonista hacia atras
function moverAtras()
{

	//console.log(oTecla.keyCode);
	//console.log(oTecla.which);
	/*
    if(oTecla.keyCode == 40 || oTecla.which == 115){//down
        $( '#protagonist' ).css("top", "+=-"+protaRebote+"px");
    }
    else if(oTecla.keyCode == 38 || oTecla.which == 119) { //^
        $( '#protagonist' ).css("top", "+="+protaRebote+"px");
    }
    else if(oTecla.keyCode == 37 || oTecla.which == 97) //<
        $( '#protagonist' ).css("left", "+="+protaRebote+"px"); 
    else if(oTecla.keyCode == 39 || oTecla.which == 100) //>
        $( '#protagonist' ).css("left", "+=-"+protaRebote+"px");

	*/

	/*
	Movimiento con estados boolean para más precisión
	*/
	if(moverLeft)
	{
		$( '#protagonist' ).css("left", "+="+protaRebote+"px");
	}
	if(moverRight)
	{
		$( '#protagonist' ).css("left","+=-"+protaRebote+"px");
	}
	if(moverTop)
	{
		$( '#protagonist' ).css("top", "+="+protaRebote+"px");
	}
	if(moverDown)
	{
		$("#protagonist").css("top", "+=-"+protaRebote+"px");
	}  
}

function randomLocation(max)
{
	var res;
	do
	{
		res=Math.floor(Math.random()*max);
	}
	while(res<=30 || res>=max-100);
	return res;

}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function resizarCampoJuego()
{

	var antiguaAltura=juegoAltura;
	var antiguaAnchura=juegoAnchura;

	var margen=$(window).outerWidth(true)*0.1;
	if(margen<margenMenu)
		margen=margenMenu;
	$("#display #debug p").text($(window).outerWidth(true)+"x"+ $(window).outerHeight(true));
	$("#area").height($(window).outerHeight(true)-($(window).outerHeight(true)*0.05));
	$("#area").width($(window).outerWidth(true)-margen);

	juegoAltura=$("#area").height();
	juegoAnchura=$("#area").width();

	$("#paredAbajo").css("top", juegoAltura - juegoAltura*0.05+"px");
	$("#paredAbajo").css("width", juegoAnchura +"px");
	$("#paredArriba").css("width", juegoAnchura +"px");
	if(juegoAnchura>1180)
		$("#paredDerecha").css("left", juegoAnchura - 30 +"px");
	else
		$("#paredDerecha").css("left", juegoAnchura - 40 +"px");
	$("#paredDerecha").css("height", juegoAltura +"px");
	$("#paredIzquierda").css("height", juegoAltura +"px");

	
	$("#display").css("left", juegoAnchura+(margen/20)+"px");
	$("#display").css("width", margen-(margen/20)+"px");

	var difAltura=juegoAltura-antiguaAltura;
	var alturaProta=$("#protagonist").position().top;
	var anchuraProta=$("#protagonist").position().left;
	var difAnchura=juegoAnchura-antiguaAnchura;

	if( ultimaTecla && difAltura<0 && alturaProta>juegoAltura)//si se reduce el campo por abajo y el prota queda fuera de la zona lo mueve hacia arriba
		$("#protagonist").css("top", alturaProta+difAltura+"px");

	if(ultimaTecla && difAnchura<0 && anchuraProta>juegoAnchura) //si se reduce el campo por la izquierda y el prota queda fuera de zona lo mueve hacia dentro
		$("#protagonist").css("left", anchuraProta+difAnchura+"px");


	


}

function moverProtagonista(vel)
{
	/*
	Con keydown no puedes registrar dos teclas al mismo tiempo
	Para poder moverse en diagonal se hace con estados boolean
	*/

	//disminuir velocidad en diagonal
	var iCounter=0;


	if(moverLeft)
		iCounter++;
	if(moverRight)
		iCounter++;
	if(moverTop)
		iCounter++;
	if(moverDown)
		iCounter++;

	if(iCounter>1)
		vel=vel/1.5;


	if(moverLeft)
	{
		$( '#protagonist' ).css("left", "+=-"+vel+"px");
	}
	if(moverRight)
	{
		$( '#protagonist' ).css("left","+="+vel+"px");
	}
	if(moverTop)
	{
		$( '#protagonist' ).css("top", "-="+vel+"px");
	}
	if(moverDown)
	{
		$("#protagonist").css("top", "+=+"+vel+"px");
	}
	if(teclaDisparar)
	{	
		disparar();


	}
}
//DISPAROS
function dispararProyectiles()
{
	//conseguir posición del protagonista
	var oPosition=$("#protagonist").position();
	//crear div con la bala
	var sBala="<div id='proyectil'></div>";
	$("#area").append(sBala);
	var oProyectil=$("#area #proyectil").last();
	oProyectil.addClass("proyectil");
	oProyectil.css("left", oPosition.left+"px");
	oProyectil.css("top", oPosition.top+"px");

	var direccion={left: "+="+proyectilSpeed+"px"};
	var movimiento={};

	//console.log(ultimaTecla.which);

	/*
	Si hay dos botones pulsados, arriba y abajo con derecha o izquierda, es decir si se mueve en diagonal disparará horizontalmente
	Si solo hay uno pulsado disparará en la dirección que se este moviendo ó en la última dirección que se movió
	*/
	if(moverTop && moverRight) // arriba y derecha
	{
		direccion={left: "+="+proyectilSpeed+"px"};
	}
	else if(moverTop && moverLeft) // arriba y izquierda
	{
		direccion={left: "+=-"+proyectilSpeed+"px"};
	}
	else if(moverDown && moverRight) // abajo y derecha
	{
		direccion={left: "+="+proyectilSpeed+"px"};
	}
	else if(moverDown && moverLeft) // abajo y izquierda
	{
		direccion={left: "+=-"+proyectilSpeed+"px"};
	}
	else if(ultimaTecla==null)
	{
		direccion={left: "+="+proyectilSpeed+"px"};
	}
	else if(ultimaTecla.keyCode == 38 || ultimaTecla.which == 119)
	{
		direccion={top: "+=-"+proyectilSpeed+"px"};
	}
	else if(ultimaTecla.keyCode == 40 || ultimaTecla.which == 115)  //down
	{
		direccion={top: "+="+proyectilSpeed+"px"};
	}

	else if(ultimaTecla.keyCode == 37 || ultimaTecla.which == 97) //<
	{
		direccion={left: "+=-"+proyectilSpeed+"px"};
	}

	else if(ultimaTecla.keyCode == 39 || ultimaTecla.which == 100) //>
	{
		direccion={left: "+="+proyectilSpeed+"px"};
	}


	moverProyectil();		

	function moverProyectil()
	{

		
		oProyectil.animate( direccion ,50);
		
		
		/*
		oProyectil.animate({
			o
			//width: "300px"
		  }, {
			duration: 50,
			easing: "linear",
		  });
		  */

		//if(oProyectil.position().left<juegoAnchura)
		if( oProyectil.position().left<juegoAnchura && !colisionProyectil())
			setTimeout(moverProyectil, refreshRate);
		else
		{
			oProyectil.stop(false, false);
			oProyectil.remove();
		}
	}

	function colisionProyectil()
	{

		if(overlaps(oProyectil, pDer))
			return true;
		else if(overlaps(oProyectil, pArriba))
			return true;
		else if(overlaps(oProyectil, pIzq))
			return true;
		else if(overlaps(oProyectil, pAbajo))
			return true;
		else
			for(var i=0;i<oCajas.length;i++)
				if(overlaps(oProyectil, $(oCajas[i]))) //si choca con un enemigo destruye el enemigo y el proyectil
				{
					$(oCajas[i]).remove();
					actualizarPuntuaciones(matarEnemigoPuntuacion);
					return true;		
				}
		for(var i=0;i<oObstaculos.length;i++)
			if(overlaps(oProyectil, $(oObstaculos[i]))) //los bloques obstaculos bloquean proyectiles
				return true;
		return false;
	}

}

function actualizarPuntuaciones(update)
{
	var puntuacion= parseInt($("#display #puntuaciones p:first span").text());
	puntuacion+=update;
	$("#display #puntuaciones p:first span").text(puntuacion);
}

function actualizarPuntuacionVida()
{
	$("#protagonist").effect( "pulsate", "fast" );
	var i;
	for(i=0;i<vidas;i++)
	{
		var sImagenHeart="<div class='heart'><img src='img/heart.png'/></div>";
		$("#area").append(sImagenHeart);
	}
	
	var iMedida=0;

	$(".heart").each(function()
	{
		iMedida+=125;
	});

	if(juegoAnchura/iMedida > 12)
		$(".heart:first").css("margin-left", juegoAnchura/2.3+"px");
	else if(juegoAnchura/iMedida > 9)
		$(".heart:first").css("margin-left", juegoAnchura/2.4+"px");
	else if(juegoAnchura/iMedida > 6)
		$(".heart:first").css("margin-left", juegoAnchura/2.5+"px");
	else if(juegoAnchura/iMedida > 4)
		$(".heart:first").css("margin-left", juegoAnchura/3+"px");	
	else if(juegoAnchura/iMedida > 3)
		$(".heart:first").css("margin-left", juegoAnchura/3.3+"px");
	else if(juegoAnchura/iMedida > 2.5)
		$(".heart:first").css("margin-left", juegoAnchura/3.5+"px");
	else if(juegoAnchura/iMedida > 2)
		$(".heart:first").css("margin-left", juegoAnchura/4.5+"px");
	else if(juegoAnchura/iMedida > 1.5)
		$(".heart:first").css("margin-left", juegoAnchura/6+"px");


	$( ".heart:last > img" ).hide( "bounce", 2000, function()
	{
		$(".heart").each(function()
		{
			$(this).hide("fade", 1000);
		});	
	});
	
	setTimeout(function()
	{
		$(".heart").each(function()
		{
			$(this).remove();
		});
	},2800);

	vidas--;
	$("#display #puntuaciones p:last span").text(vidas);

	if(vidas<=0)
	{
		$("#dialog-confirm p bold").text(nivelActual+"\n Puntuación: "+$("#display #puntuaciones p:first span").text());
		$("#dialog-confirm").dialog("open");
		protaSpeed=0;
		enemySpeed=0;
		clearTimeout(tiempoNivelCancelar);
		
	}

}

function resetVidas()
{
	vidas=4;
	$("#display #puntuaciones p:last span").text(vidas);
}

function reiniciarPartida()
{
	//console.log("reiniciar");
	guardarScore( parseInt($("#display #puntuaciones p:first span").text()));
	location.reload();
}

function reiniciarNivel()
{
	
	$("#llave").remove();
	protaSpeed=8;
	empezar_juego(nivelActual);
}

function setTiempoNivel()
{
	var tiempoRestante=parseInt($("#display #puntuaciones p:first").next().find("span").text());
	tiempoRestante-=1;
	$("#display #puntuaciones p:first").next().find("span").text(tiempoRestante);

	if(tiempoRestante<=0)
	{
		$( "#dialog-timeOut" ).dialog("open");
		enemySpeed=0;
		protaSpeed=0;
	}
	else
	tiempoNivelCancelar=setTimeout(setTiempoNivel, 1000);
}


function guardarScore(nuevaPuntuacion)
{
	arrayScores.push(nuevaPuntuacion);
	arrayScores.sort(function(a, b){return b-a});
	if(arrayScores.length>5)
	{
		
		arrayScores.pop();
	}

	localStorage["records"]=JSON.stringify(arrayScores);
	cargarPuntuacion();

}

function cargarPuntuacion()
{
	if(localStorage["records"]!=null)
	{
		arrayScores=JSON.parse(localStorage["records"]);
		//console.log(arrayScores);
		for(var i=1;i<=arrayScores.length;i++)
		{
			$("#display #record").append("<p>"+i+". "+arrayScores[i-1]+"</p>");
		}
	}
	else
	{		
		localStorage["records"]=JSON.stringify(arrayScores);
	}
}
