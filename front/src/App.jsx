import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const API_URL = "http://localhost:3333/api";

  // Controla qual nível da aula está selecionado (1, 2, 3 ou 4)
  const [nivelAtivo, setNivelAtivo] = useState(1);

  // Estado para mostrar erro de conexão / CORS na tela
  const [erroConexao, setErroConexao] = useState("");

  // ESTADOS DO NÍVEL 1
  const [produtosNivel1, setProdutosNivel1] = useState([]);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  // ESTADOS DO NÍVEL 2
  const [respostaNivel2, setRespostaNivel2] = useState({
    totalEncontrados: 0,
    categoriasDisponiveis: [],
    dados: [],
  });
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [apenasEstoque, setApenasEstoque] = useState(false);
  const [ordem, setOrdem] = useState("padrao");

  // ESTADOS DO NÍVEL 3
  const [catalogoNivel3, setCatalogoNivel3] = useState({
    loja: "",
    totalItens: 0,
    catalogo: [],
  });

  // ESTADOS DO NÍVEL 4
  const [dashboard, setDashboard] = useState(null);
  const [cliente, setCliente] = useState("");
  const [cupom, setCupom] = useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState("1");
  const [quantidadeCompra, setQuantidadeCompra] = useState(1);
  const [feedbackPedido, setFeedbackPedido] = useState(null);

  // FUNÇÕES DO NÍVEL 1
  const carregarNivel1 = async () => {
    try {
      setErroConexao("");

      const response = await fetch(`${API_URL}/produtos`); //toda requisição via fetch é texto

      const dados = await response.json();
      setProdutosNivel1(dados);
    } catch (error) {
      console.log("error no fetch: ", error);
      setErroConexao(
        "falha ao buscar dados da api!, abra o console (F12) para verificar",
      );
    }
  };

  const cadastrarProdutoSimples = async (e) => {
    e.preventDefault();
    try {
      setErroConexao("");

      await fetch(`${API_URL}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          categoria,
          preco: Number(preco),
          estoque: Number(estoque),
        }),
      });

      setNome("");
      setCategoria("");
      setPreco("");
      setEstoque("");
    } catch (error) {
      console.log("error no fetch: ", error);
      setErroConexao(
        "falha ao buscar dados da api!, abra o console (F12) para verificar",
      );
    }
  };

  // FUNÇÕES DO NÍVEL 2
  const carregarNivel2 = async () => {
    try {
      setErroConexao("");
      const Params = new URLSearchParams();

      if (filtroCategoria !== "Todas")
        Params.append("categoria", filtroCategoria);
      if (filtroBusca) Params.append("busca", filtroBusca);
      if (apenasEstoque) Params.append("apenasEstoque", "true");
      if (ordem !== "padrao") Params.append("ordem", ordem);
      //GET /api/produtos/filtro?categoria=""

      const resposta = await fetch(
        `${API_URL}/produtos/filtro?${Params.toString()}`,
      ); //texto
      const dados = await resposta.json();

      setRespostaNivel2(dados);
    } catch (error) {
      console.log("error no fetch: ", error);
      setErroConexao(
        "falha ao buscar dados da api!, abra o console (F12) para verificar",
      );
    }
  };

  // FUNÇÕES DO NÍVEL 3
  const carregarNivel3 = async () => {
    try {
      setErroConexao("");

      const response = await fetch(`${API_URL}/produtos/detalhados`); //toda requisição via fetch é texto

      const dados = await response.json();
      setCatalogoNivel3(dados);
    } catch (error) {
      console.log("error no fetch: ", error);
      setErroConexao(
        "falha ao buscar dados da api!, abra o console (F12) para verificar",
      );
    }
  };

  const alterarEstoque = async (id, novoEstoque) => {
    if (novoEstoque < 0) return;
    try {
      await fetch(`${API_URL}/produtos/${id}`,{
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({estoque:novoEstoque})
      })
      carregarNivel3()
    } catch (error) {
      console.log("error no fetch: ", error);
      setErroConexao(
        "falha ao buscar dados da api!, abra o console (F12) para verificar",
      );
    }
  };

  // FUNÇÕES DO NÍVEL 4
  const carregarNivel4 = async () => {};

  const realizarPedido = async (e) => {
    e.preventDefault();
    setFeedbackPedido(null);

    try {
      // Tratamento quando o Back-end retorna erro 400 ou 422 (ex: estoque esgotado ou cupom inválido)
      if (!resposta.ok) {
        setFeedbackPedido({
          sucesso: false,
          status: resposta.status,
          mensagem: dados.message,
          detalhes: dados.detalhes || null,
          cuponsAceitos: dados.cuponsAceitosParaTeste || null,
        });
        return;
      }

      setFeedbackPedido({
        sucesso: true,
        mensagem: dados.message,
        resumo: dados.resumoFinanceiro,
      });

      setCliente("");
      setCupom("");
      setQuantidadeCompra(1);
      carregarNivel4();
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      setErroConexao("Falha de conexão ao tentar enviar o pedido.");
    }
  };

  // Carrega os dados sempre que trocar de nível ou mexer nos filtros do Nível 2
  useEffect(() => {
    if (nivelAtivo === 1) carregarNivel1();
    if (nivelAtivo === 2) carregarNivel2();
    if (nivelAtivo === 3) carregarNivel3();
    if (nivelAtivo === 4) carregarNivel4();
  }, [nivelAtivo, filtroCategoria, apenasEstoque, ordem]);

  return (
    <div className="container">
      <header className="cabecalho">
        <h1>Loja Geek - Integração Front & Back</h1>
        <p>Escolha o nível de dificuldade para testar o consumo da API</p>

        <div className="abas-niveis">
          <button
            className={nivelAtivo === 1 ? "ativo" : ""}
            onClick={() => setNivelAtivo(1)}
          >
            Nível 1: Básico (Array)
          </button>
          <button
            className={nivelAtivo === 2 ? "ativo" : ""}
            onClick={() => setNivelAtivo(2)}
          >
            Nível 2: Filtros e Metadados
          </button>
          <button
            className={nivelAtivo === 3 ? "ativo" : ""}
            onClick={() => setNivelAtivo(3)}
          >
            Nível 3: Objetos Aninhados
          </button>
          <button
            className={nivelAtivo === 4 ? "ativo" : ""}
            onClick={() => setNivelAtivo(4)}
          >
            Nível 4: Pedidos & Erros
          </button>
        </div>
      </header>

      {/* Alerta didático quando ocorre erro de CORS ou servidor desligado */}
      {erroConexao && (
        <div className="alerta-erro">
          <strong>Erro na comunicação com o Back-end:</strong>
          <p>{erroConexao}</p>
        </div>
      )}

      {/* =====================================================================
          TELA DO NÍVEL 1: GET retornando Array direto + POST básico
      ===================================================================== */}
      {nivelAtivo === 1 && (
        <section>
          <div className="explicacao">
            <h2>Nível 1: Array Plano e Cadastro Simples</h2>
            <p>
              Rota: <code>GET /api/produtos</code> e{" "}
              <code>POST /api/produtos</code>. A resposta da API é um array
              direto <code>[...]</code>.
            </p>
          </div>

          <form onSubmit={cadastrarProdutoSimples} className="formulario">
            <h3>Cadastrar Novo Produto</h3>
            <div className="linha-inputs">
              <input
                type="text"
                placeholder="Nome do produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Categoria (ex: Action Figure)"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço (R$)"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Estoque"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                required
              />
              <button type="submit">Cadastrar</button>
            </div>
          </form>

          <div className="grade-cards">
            {produtosNivel1.map((item) => (
              <div key={item.id} className="card">
                <span className="badge">{item.categoria}</span>
                <h3>{item.nome}</h3>
                <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>
                <p>Estoque: {item.estoque} un.</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          TELA DO NÍVEL 2: Query Params e Objeto com Metadados
      ===================================================================== */}
      {nivelAtivo === 2 && (
        <section>
          <div className="explicacao">
            <h2>Nível 2: Filtros via Query Params e Objeto com Metadados</h2>
            <p>
              Rota:{" "}
              <code>GET /api/produtos/filtro?categoria=...&ordem=...</code>. A
              resposta vem dentro de <code>resposta.dados</code> junto com{" "}
              <code>totalEncontrados</code> e <code>categoriasDisponiveis</code>
              .
            </p>
          </div>

          <div className="barra-filtros">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="Todas">Todas as Categorias</option>
              {respostaNivel2.categoriasDisponiveis.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              <option value="padrao">Ordenação Padrão</option>
              <option value="menor_preco">Menor Preço</option>
              <option value="maior_preco">Maior Preço</option>
              <option value="melhor_avaliacao">Melhor Avaliação</option>
            </select>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={apenasEstoque}
                onChange={(e) => setApenasEstoque(e.target.checked)}
              />
              Apenas em estoque
            </label>

            <div className="busca-box">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
              <button type="button" onClick={carregarNivel2}>
                Buscar
              </button>
            </div>
          </div>

          <p className="contador-resultado">
            Produtos encontrados:{" "}
            <strong>{respostaNivel2.totalEncontrados}</strong>
          </p>

          <div className="grade-cards">
            {respostaNivel2.dados.map((item) => (
              <div key={item.id} className="card">
                <span className="badge">{item.categoria}</span>
                <h3>{item.nome}</h3>
                <p className="preco">R$ {Number(item.preco).toFixed(2)}</p>
                <p>Avaliação: ⭐ {item.avaliacao}</p>
                <p className={item.estoque === 0 ? "texto-erro" : ""}>
                  {item.estoque === 0
                    ? "Esgotado"
                    : `Estoque: ${item.estoque} un.`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          TELA DO NÍVEL 3: Objetos Aninhados, Array de Tags e PATCH
      ===================================================================== */}
      {nivelAtivo === 3 && (
        <section>
          <div className="explicacao">
            <h2>
              Nível 3: Objetos Aninhados, Sub-listas e Atualização (PATCH)
            </h2>
            <p>
              Rota: <code>GET /api/produtos/detalhados</code> e{" "}
              <code>PATCH /api/produtos/:id</code>. Aqui acessamos objetos
              internos como <code>item.precificacao.precoFinal</code>,{" "}
              <code>item.especificacoes.franquia</code> e fazemos um{" "}
              <code>.map()</code> dentro de outro para renderizar{" "}
              <code>item.tags</code>.
            </p>
          </div>

          <div className="grade-cards">
            {catalogoNivel3.catalogo.map((item) => (
              <div key={item.id} className="card card-detalhado">
                <div className="topo-card">
                  <span className="badge">{item.especificacoes?.franquia}</span>
                  <span className="status-tag">
                    {item.disponibilidade?.status}
                  </span>
                </div>

                <h3>{item.nome}</h3>
                <p className="fabricante">
                  Fabricante: {item.especificacoes?.fabricante}
                </p>

                {/* Objeto aninhado de precificação */}
                <div className="box-preco">
                  {item.precificacao?.emPromocao && (
                    <span className="preco-antigo">
                      De R$ {item.precificacao.precoOriginal.toFixed(2)} (-
                      {item.precificacao.percentualDesconto}%)
                    </span>
                  )}
                  <strong className="preco">
                    Por R$ {item.precificacao?.precoFinal.toFixed(2)}
                  </strong>
                </div>

                {/* Sub-array de tags dentro do produto */}
                <div className="lista-tags">
                  {item.tags?.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Controles para testar o PATCH de estoque */}
                <div className="controle-estoque">
                  <span>Estoque: {item.disponibilidade?.quantidade}</span>
                  <div>
                    <button
                      onClick={() =>
                        alterarEstoque(
                          item.id,
                          item.disponibilidade.quantidade - 1,
                        )
                      }
                    >
                      -1
                    </button>
                    <button
                      onClick={() =>
                        alterarEstoque(
                          item.id,
                          item.disponibilidade.quantidade + 1,
                        )
                      }
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          TELA DO NÍVEL 4: Checkout com Validação de Erros (400/422) e Dashboard
      ===================================================================== */}
      {nivelAtivo === 4 && (
        <section>
          <div className="explicacao">
            <h2>Nível 4: Checkout de Pedido, Cupons e Tratamento de Erros</h2>
            <p>
              Rotas: <code>POST /api/pedidos</code> e{" "}
              <code>GET /api/dashboard</code>. Teste comprar a{" "}
              <strong>Estátua Batman (Esgotada)</strong> ou digitar um cupom
              inválido para ver como tratar erros <code>422</code> vindos do
              Back-end! Cupons válidos: <code>GEEK10</code>,{" "}
              <code>FULLSTACK15</code>, <code>DEV20</code>.
            </p>
          </div>

          {/* Indicadores do Dashboard */}
          {dashboard && (
            <div className="painel-resumo">
              <div className="bloco-indicador">
                <span>Total de Produtos</span>
                <strong>
                  {dashboard.indicadores.totalProdutosCadastrados}
                </strong>
              </div>
              <div className="bloco-indicador">
                <span>Pedidos Realizados</span>
                <strong>{dashboard.indicadores.totalPedidosRealizados}</strong>
              </div>
              <div className="bloco-indicador">
                <span>Faturamento Total</span>
                <strong>
                  R$ {dashboard.indicadores.faturamentoTotal.toFixed(2)}
                </strong>
              </div>
              <div className="bloco-indicador">
                <span>Ticket Médio</span>
                <strong>
                  R$ {dashboard.indicadores.ticketMedio.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {/* Formulário de Checkout */}
          <form onSubmit={realizarPedido} className="formulario">
            <h3>Simular Compra (Checkout)</h3>
            <div className="linha-inputs">
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
              />

              <select
                value={produtoSelecionadoId}
                onChange={(e) => setProdutoSelecionadoId(e.target.value)}
              >
                {produtosNivel1.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nome} (Estoque: {prod.estoque}) - R$ {prod.preco}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Qtd"
                value={quantidadeCompra}
                onChange={(e) => setQuantidadeCompra(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Cupom (ex: GEEK10)"
                value={cupom}
                onChange={(e) => setCupom(e.target.value)}
              />

              <button type="submit">Finalizar Pedido</button>
            </div>
          </form>

          {/* Resposta de Sucesso ou Erro 400/422 da API */}
          {feedbackPedido && (
            <div
              className={
                feedbackPedido.sucesso ? "alerta-sucesso" : "alerta-erro"
              }
            >
              <strong>{feedbackPedido.mensagem}</strong>

              {feedbackPedido.detalhes && (
                <ul>
                  {feedbackPedido.detalhes.map((erroItem, idx) => (
                    <li key={idx}>
                      {erroItem.nome}: {erroItem.motivo} (Solicitado:{" "}
                      {erroItem.quantidadeSolicitada}, Disponível:{" "}
                      {erroItem.estoqueDisponivel})
                    </li>
                  ))}
                </ul>
              )}

              {feedbackPedido.cuponsAceitos && (
                <p>Cupons aceitos: {feedbackPedido.cuponsAceitos.join(", ")}</p>
              )}

              {feedbackPedido.resumo && (
                <p>
                  Valor Bruto: R$ {feedbackPedido.resumo.valorBruto} | Desconto
                  Cupom: R$ {feedbackPedido.resumo.valorDesconto} |{" "}
                  <strong>
                    Total Pago: R$ {feedbackPedido.resumo.valorTotal}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* Lista dos últimos pedidos */}
          {dashboard && (
            <div className="historico-pedidos">
              <h3>Últimos Pedidos Registrados</h3>
              {dashboard.ultimosPedidos.map((pedido) => (
                <div key={pedido.id} className="item-pedido">
                  <div>
                    <strong>Pedido #{pedido.id}</strong> - Cliente:{" "}
                    {pedido.cliente}{" "}
                    {pedido.cupom && (
                      <span className="badge">Cupom: {pedido.cupom}</span>
                    )}
                  </div>
                  <ul>
                    {pedido.itens.map((it, idx) => (
                      <li key={idx}>
                        {it.quantidade}x {it.nome} (R$ {it.subtotal})
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total: R$ {pedido.valorTotal.toFixed(2)}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
