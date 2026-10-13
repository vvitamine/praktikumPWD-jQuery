$(function(){

    let cart = [];

    const rupiah = n =>
        "Rp" + n.toLocaleString("id-ID");

    // =========================
    // TYPING EFFECT
    // =========================
    function typing(text, el, speed, done){
        let i = 0;

        function type(){
            if(i < text.length){
                $(el).append(text[i++]);
                setTimeout(type, speed);
            }else if(done) done();
        }

        type();
    }

    typing("Selamat Datang di Sweet ", "#typingText", 65, function(){
        $("#typingText").append('<span class="blue-text"></span>');
        typing("Crumbs Bakery", "#typingText .blue-text", 65);
    });


    // =========================
    // FILTER + SEARCH
    // =========================
    function filterProduk(category){
        $(".filter").removeClass("active");
        $('.filter[data-filter="' + category + '"]').addClass("active");

        const search = $("#searchProduk").val().toLowerCase();

        $(".produk-card").each(function(){
            const card = $(this);
            const cocokKategori =
                category === "all" || card.data("category") === category;
            const cocokSearch =
                card.data("name").toLowerCase().includes(search);

            card.toggle(cocokKategori && cocokSearch);
        });
    }

    $(".filter").click(function(){
        filterProduk($(this).data("filter"));
    });

    $(".nav-links a").click(function(e){
        e.preventDefault();
        filterProduk($(this).data("filter"));
        $("#produk")[0].scrollIntoView({behavior:"smooth"});
        $(".nav-links").removeClass("show");
    });

    $("#searchProduk").on("input", function(){
        filterProduk($(".filter.active").data("filter"));
    });


    // =========================
    // CART
    // =========================
    function updateCart(){

        $("#cartBadge").text(
            cart.reduce((sum,item) => sum + item.qty, 0)
        );

        if(!cart.length){
            $("#cartItems").html(`
                <div class="empty-cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Keranjang masih kosong.</p>
                </div>
            `);
            $("#cartTotal").text("Rp0");
            return;
        }

        let total = 0;

        $("#cartItems").html(cart.map((item,i) => {
            total += item.price * item.qty;

            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <small>${rupiah(item.price)}</small>

                        <div class="qty">
                            <button class="minus" data-i="${i}">−</button>
                            <span>${item.qty}</span>
                            <button class="plus" data-i="${i}">+</button>
                        </div>
                    </div>

                    <button class="remove-item" data-i="${i}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }).join(""));

        $("#cartTotal").text(rupiah(total));
    }


    $(".add-btn").click(function(){

        const card = $(this).closest(".produk-card");
        const name = card.data("name");
        const price = Number(card.data("price"));

        const item = cart.find(x => x.name === name);

        if(item){
            item.qty++;
        }else{
            cart.push({name,price,qty:1});
        }

        updateCart();

        $("#toast").addClass("show");

        setTimeout(() => {
            $("#toast").removeClass("show");
        },1800);
    });


    $(document).on("click",".plus",function(){
        cart[$(this).data("i")].qty++;
        updateCart();
    });

    $(document).on("click",".minus",function(){
        const i = $(this).data("i");

        cart[i].qty--;

        if(cart[i].qty <= 0)
            cart.splice(i,1);

        updateCart();
    });

    $(document).on("click",".remove-item",function(){
        cart.splice($(this).data("i"),1);
        updateCart();
    });


    // =========================
    // OPEN / CLOSE CART
    // =========================
    function openCart(){
        $("#cartPanel,#cartOverlay").addClass("open show");
    }

    function closeCart(){
        $("#cartPanel").removeClass("open");
        $("#cartOverlay").removeClass("show");
    }

    $("#cartBtn").click(openCart);
    $("#closeCart,#cartOverlay").click(closeCart);


    // =========================
    // ORDER HISTORY
    // =========================
    function getHistory(){
        return JSON.parse(localStorage.getItem("sweetCrumbsHistory") || "[]");
    }

    function renderHistory(){

        const history = getHistory();

        if(!history.length){
            $("#historyContent").html(`
                <div class="no-history">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <p>Belum ada riwayat pesanan.</p>
                </div>
            `);
            return;
        }

        $("#historyContent").html(history.map(order => `
            <div class="history-card">
                <div class="history-top">
                    <strong>Pesanan #${order.id}</strong>
                    <span class="history-date">${order.date}</span>
                </div>

                <ul>
                    ${order.items.map(item =>
                        `<li>${item.name} × ${item.qty}</li>`
                    ).join("")}
                </ul>

                <div class="history-total">
                    <span>${order.totalItems} item</span>
                    <span>${rupiah(order.total)}</span>
                </div>
            </div>
        `).join(""));
    }


    $("#btnCheckout").click(function(){

        if(!cart.length){
            alert("Keranjang masih kosong!");
            return;
        }

        const total = cart.reduce(
            (sum,item) => sum + item.price * item.qty,0
        );

        const order = {
            id: Date.now().toString().slice(-6),
            date: new Date().toLocaleString("id-ID"),
            items: cart.map(item => ({...item})),
            total: total,
            totalItems: cart.reduce((sum,item) => sum + item.qty,0)
        };

        const history = getHistory();

        history.unshift(order);

        localStorage.setItem(
            "sweetCrumbsHistory",
            JSON.stringify(history)
        );

        cart = [];

        updateCart();
        renderHistory();
        closeCart();

        alert("Pesanan berhasil dibuat! ♡");
    });


    // =========================
    // HISTORY PANEL
    // =========================
    function openHistory(){
        renderHistory();
        $("#historyPanel,#historyOverlay").addClass("open show");
    }

    function closeHistory(){
        $("#historyPanel").removeClass("open");
        $("#historyOverlay").removeClass("show");
    }

    $("#historyBtn").click(openHistory);
    $("#closeHistory,#historyOverlay").click(closeHistory);


    // =========================
    // MOBILE MENU
    // =========================
    $("#menuBtn").click(function(){
        $(".nav-links").toggleClass("show");
    });


    // =========================
    // INITIAL
    // =========================
    updateCart();
    renderHistory();

});