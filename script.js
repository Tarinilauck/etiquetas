window.onload = () => {
  const input = document.getElementById("arquivo");

  const printEtiquetas = (content) => {
    var popupWin = window.open("", "_blank", 'width="100%",height="100%"');

    // Popup locked by browser
    if (!popupWin) {
      console.log("Popup was blocked");
      return false;
    }

    popupWin.document.write(
      '<html><head><link rel="stylesheet" href="style.css" /><link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" type="text/css"></head><body>' +
        content +
        "</body></html>"
    );

    popupWin.document.body.setAttribute(
      "style",
      'font-family: "Open Sans" !important'
    );

    setTimeout(function () {
      popupWin.document.close();
      popupWin.print();
      popupWin.close();
    }, 200);
  };

  input.onchange = () => {
    if (input && input.files.length) {
      let file = input.files[0];
      let fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);

      function receivedText() {
        const lines = String(fr.result).split("\n").slice(1);
        const mapped = lines.map((line) => {
          const matched = line.match(
            /^([A-zÀ-ú0-9]+),([A-zÀ-ú0-9]+),(\w+),([A-zÀ-ú0-9]+),(\d+),\"(R\$\s[0-9,.]+)\"\r*$/i
          );

          if (!matched) return;
          const [_, nome, tipo, tamanho, cor, quantidade, preco] = matched;
          return {
            nome,
            tipo,
            tamanho,
            cor,
            quantidade: parseInt(quantidade),
            preco,
          };
        });

        const over = [];

        mapped.forEach((it) => {
          for (let i = 0; i < it.quantidade; i++) {
            over.push(it);
          }
        });

        const tbody = document.querySelector("table tbody");
        // add over into body
        const content = over.reduce((acc, at, i) => {
          if (i % 2 === 0) return acc;
          return (acc += [
            "<tr>",
            `<td>${at.tipo} ${at.nome}</td>`,
            over[i + 1]
              ? `<td>${over[i + 1].tipo} ${over[i + 1].nome}</td>`
              : "",
            "</tr>",
            "<tr>",
            `<td class="preco">${at.preco}</td>`,
            over[i + 1] ? `<td class="preco">${over[i + 1].preco}</td>` : "",
            "</tr>",
            "<tr>",
            `<td><b>${at.tamanho}</b> - ${at.cor}</td>`,
            over[i + 1]
              ? `<td><b>${over[i + 1].tamanho}</b> - ${over[i + 1].cor}</td>`
              : "",
            "</tr>",
          ].join("\n"));
        }, "");

        tbody.innerHTML = content;
        input.value = "";
      }
    } else {
      console.log("Não foi possível ler o arquivo");
    }
  };

  const printbtn = document.getElementById("print-btn");
  printbtn.onclick = () => {
    const tbl = document.querySelector("table");
    printEtiquetas(`<table>${tbl.innerHTML}</table>`);
  };

  const downloadExampleBtn = document.getElementById("btn-exemplo");
  downloadExampleBtn.onclick = () => {
    const data = [
      `Nome,Tipo,Tamanho,Cor,Quantidade,Preço`,
      `Tata,Saia,P,Rosa,1,"R$ 129,00"`,
      `Tata,Saia,M,Rosa,2,"R$ 129,00"`,
      `Jonathan,Calça,34,Azul,4,"R$ 999,99"`,
      `Mariana,Vestido,U,Vermelho,2,"R$ 199,00"`,
    ].join("\n");

    const blob = new Blob([data], { type: "text/csv" });

    // Creating an object for downloading url
    const url = window.URL.createObjectURL(blob);

    // Creating an anchor(a) tag of HTML
    const a = document.createElement("a");

    // Passing the blob downloading url
    a.setAttribute("href", url);

    // Setting the anchor tag attribute for downloading
    // and passing the download file name
    a.setAttribute("download", "download.csv");

    // Performing a download with click
    a.click();
  };
};
