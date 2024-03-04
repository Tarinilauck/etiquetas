var dpr = window.devicePixelRatio;
var inch = 25.4; //1inch = 25.4 mm
var ppi = 264; //Ipad3 density

function mmToPx(mm) {
  return ((mm / inch) * ppi) / dpr;
}

window.onload = () => {
  const previa = document.querySelector(".previa");
  if (previa) {
    previa.style.width = `${mmToPx(100)}px`;
    previa.style.height = `${mmToPx(150)}px`;
  }

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
            // Nome,            Tipo,         Tamanho, Cor,        Quantidade, Preço
            /^([A-zÀ-ú0-9& ]*),([A-zÀ-ú0-9& ]*),([A-zÀ-ú0-9& ]*),([A-zÀ-ú0-9& ]*),(\d+),\"(R\$\s[0-9,.]+)\"\r*$/i
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

        console.log("mapped:", mapped);
        mapped.forEach((it) => {
          // if (!it) return;
          for (let i = 0; i < it.quantidade ?? 1; i++) {
            over.push(it);
          }
        });

        const tbody = document.querySelector("table tbody");
        // add over into body
        const content = over.reduce((acc, at, i) => {
          if (i % 2 !== 0) return acc;
          return (acc += [
            "<tr>",
            `<td>`,
            `<div>${at.tipo} ${at.nome}</div>`,
            `<div class="preco">${at.preco}</div>`,
            `<div>${[at.tamanho ? `<b>${at.tamanho}</b>` : "", at.cor]
              .filter((t) => Boolean(t))
              .join(" - ")}</div>`,
            `</td>`,
            ...(over[i + 1]
              ? [
                  `<td>`,
                  `<div>${over[i + 1].tipo} ${over[i + 1].nome}</div>`,
                  `<div class="preco">${over[i + 1].preco}</div>`,
                  `<div>${[
                    over[i + 1].tamanho ? `<b>${over[i + 1].tamanho}</b>` : "",
                    over[i + 1].cor,
                  ]
                    .filter((t) => Boolean(t))
                    .join(" - ")}
                  </div>`,
                  `</td>`,
                ]
              : []),
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
      `Maria,Calça,34,Azul,4,"R$ 999,99"`,
      `Mariana,Vestido,U,Vermelho,2,"R$ 199,00"`,
    ].join("\n");

    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "itens-exemplo.csv");
    a.click();
  };
};
