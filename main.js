<script>
        // JavaScript para controlar o menu hambúrguer
        const menuToggle = document.getElementById('menuToggle');
        const navLista = document.getElementById('navLista');
        
        menuToggle.addEventListener('click', function() {
            navLista.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um item
        const navItems = document.querySelectorAll('.nav_item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLista.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    </script>