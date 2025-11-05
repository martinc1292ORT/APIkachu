export default function PokemonDetail({ params }) {
  const { name } = params;
  return (
    <>
      <h1>Pokémon: {name}</h1>
      <p>Detalle del pokémon, botón “Agregar a fav” y evoluciones.</p>
    </>
  );
}
