//calcula colision
  /*
    var overlaps = (function () {
    function getPositions( elem ) {
        var pos, width, height;
        //console.log(elem);

        pos = $(elem).position();

        //console.log(pos);

        
        width = $(elem).outerWidth(true);
        height = $(elem).outerHeight(true);
        
        //width = $( elem ).width();
        //height = $( elem ).height();
        return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
    }

    function comparePositions( p1, p2 ) {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function ( a, b ) {
        var pos1 = getPositions( a ),
            pos2 = getPositions( b );
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };
})();
*/
function overlaps(jqDiv1, jqDiv2) {

      var x1 = jqDiv1.offset().left;
      var y1 = jqDiv1.offset().top;
      var h1 = jqDiv1.outerHeight(true);
      var w1 = jqDiv1.outerWidth(true);
      var b1 = y1 + h1;
      var r1 = x1 + w1;
      var x2 = jqDiv2.offset().left;
      var y2 = jqDiv2.offset().top;
      var h2 = jqDiv2.outerHeight(true);
      var w2 = jqDiv2.outerWidth(true);
      var b2 = y2 + h2;
      var r2 = x2 + w2;
        
      if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
      return true;
}

/*
function detectCollision() {
    
    //var bMueve=true;



    //paredes
    if(overlaps(prota, pIzq))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({left: "+=25px"},1);
       
    }

    if(overlaps(prota, pArriba))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({top: "+=25px"},1); 
    }

    if(overlaps(prota, pDer))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({left: "+=-25px"},1); 
    }

    if(overlaps(prota, pAbajo))
    {
        $( '#protagonist' ).stop(false,false);   
        $( '#protagonist' ).animate({top: "+=-25px"},1); 
    }
  

    //return bMueve;

}
*/
