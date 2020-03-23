import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, Alert } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: '',
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    // localStorage.setItem('repositories', JSON.stringify([]));
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  checkRepo = (repoName) => {
    const { repositories } = this.state;
    let found = false;
    repositories.forEach((repository) => {
      if (repository.name === repoName) {
        found = true;
      }
    });

    return found;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      if (newRepo.length === 0) {
        throw new Error('Insira uma URL válida.');
      }

      if (this.checkRepo(newRepo)) {
        throw new Error('Repositório duplicado.');
      }

      const response = await api.get(`/repos/${newRepo}`).catch((err) => {
        const { status } = err.response;
        switch (status) {
          case 403:
            throw new Error('Limite de requisições atingido.');
          case 404:
            throw new Error('Repositório não encontrado.');
          default:
            throw new Error(
              'Um erro ocorreu, tente novamente em alguns instantes.'
            );
        }
      });

      this.setState({ loading: false });
      this.setState({ error: '' });

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  };

  handleInputChange = async (e) => {
    this.setState({ newRepo: e.target.value });
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
            className={error.length ? 'has-error' : ''}
          />
          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        {error && <Alert>{error}</Alert>}

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
