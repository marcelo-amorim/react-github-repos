import React, { Component } from 'react';
import { FaSpinner } from 'react-icons/fa';

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Label,
  IssueFilter,
  PageNav,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    currentState: 'open',
    currentPage: 1,
    issueStates: [
      { name: 'Abertas', state: 'open' },
      { name: 'Fechadas', state: 'closed' },
      { name: 'Todas', state: 'all' },
    ],
  };

  async componentDidMount() {
    const { match } = this.props;
    const { currentState, currentPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: currentState,
          per_page: 5,
          page: currentPage,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleIssueFilter = async (e) => {
    const issueState = e.target.value;
    const { repository } = this.state;
    this.setState({ loading: true });
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: issueState,
        per_page: 5,
        currentPage: 1,
      },
    });

    this.setState({
      loading: false,
      issues: issues.data,
      currentState: issueState,
      currentPage: 1,
    });
  };

  togglePrev = async () => {
    const { currentPage, currentState, repository } = this.state;
    if (currentPage > 1) {
      const newCurrentPage = currentPage - 1;
      this.setState({ currentPage: newCurrentPage, loading: true });
      const issues = await api.get(`/repos/${repository.full_name}/issues`, {
        params: {
          state: currentState,
          per_page: 5,
          page: newCurrentPage,
        },
      });
      this.setState({
        issues: issues.data,
        loading: false,
      });
    }
  };

  toggleNext = async () => {
    const { currentPage, currentState, repository } = this.state;
    const newCurrentPage = currentPage + 1;
    this.setState({ loading: true, currentPage: newCurrentPage });
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: currentState,
        per_page: 5,
        page: newCurrentPage,
      },
    });
    this.setState({
      issues: issues.data,
      loading: false,
    });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      issueStates,
      currentState,
      currentPage,
    } = this.state;

    if (loading) {
      return (
        <Loading>
          <FaSpinner /> Buscando informações do repositório...
        </Loading>
      );
    }

    return (
      <Container>
        <Owner>
          <Link to="/"> Voltar aos repositórios </Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <p>Exibir issues: </p>
        <IssueFilter
          defaultValue={currentState}
          onChange={this.handleIssueFilter}
        >
          {issueStates.map((issueState) => (
            <option key={issueState.state} value={issueState.state}>
              {issueState.name}
            </option>
          ))}
        </IssueFilter>

        <IssueList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <Label key={String(label.id)} color={`#${label.color}`}>
                      {label.name}
                    </Label>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <PageNav>
          <button
            type="button"
            disabled={currentPage === 1 ? 1 : 0}
            onClick={this.togglePrev}
          >
            &laquo; Anterior
          </button>
          <button type="button" onClick={this.toggleNext}>
            Próximo &raquo;
          </button>
        </PageNav>
      </Container>
    );
  }
}
